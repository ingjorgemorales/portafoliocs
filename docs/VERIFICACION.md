# Resultado de verificación — 21 de octubre de 2026

## Comprobaciones completadas

| Comprobación | Resultado |
| --- | --- |
| `npm run build` | Correcto: build optimizado de Next.js 16.4.2, con comprobación TypeScript |
| `npm run typecheck` | Correcto, sin errores |
| `npm run lint` | Correcto, sin errores ni advertencias |
| `npm test` | 8 pruebas aprobadas; incluye migración real y escenarios RLS en PostgreSQL embebido |
| `npm audit` | 0 vulnerabilidades en dependencias de producción y desarrollo |
| `node scripts/smoke.mjs` | Rutas públicas y todas las secciones del panel de demo responden; API sin credenciales falla de manera explícita |
| `node scripts/smoke.mjs --production` | Correcto: demo desactivada, `/admin` devuelve 307 hacia login, proyectos de demo devuelven 404 |
| Protección HTTP | Origen no autorizado → 403; chat/contacto no configurados → 503; lectura de archivo inexistente/privado sin sesión → 404; upload no autorizado rechazado |
| `git diff --check` | Sin errores de whitespace |
| Credenciales | `.env.local` confirmado como ignorado por Git; `.env.example` sin secretos |

## Navegador

Se inspeccionó la aplicación real en el navegador integrado con pantalla estrecha (~496 px): portada, menú móvil, filtro de categoría (redujo los tres ejemplos al proyecto de Periodismo), panel administrativo, lista y editor de proyecto con Tiptap. La demostración bloquea los guardados. El chat devolvió desde el servidor el mensaje de indisponibilidad por falta de credenciales; no hubo una respuesta de IA simulada. El formulario de contacto aparece deshabilitado hasta configurar servicio y privacidad.

La anchura del contenido principal medida en DOM fue 437 px tanto en `clientWidth` como en `scrollWidth`: sin desbordamiento horizontal en esa vista. Los breakpoints de escritorio y tableta están implementados, pero no se hizo una revisión visual independiente en todos esos tamaños. La accesibilidad se revisó a nivel básico de etiquetas, estados, navegación móvil y foco; no equivale a una auditoría WCAG completa.

## Correcciones derivadas de las pruebas

- Política Storage corregida para comparar contra `storage.objects.name` explícitamente. La suite comprueba que un archivo de borrador no puede leerse y que despublicar revoca el acceso.
- Guardado de proyecto y enlaces comprobado como transacción: un enlace inválido produce rollback de todos los cambios.
- Protección de administrador adelantada al proxy, además de los controles del servidor y RLS, para evitar renderizado previo al rechazo.
- Pantalla de carga global trasladada al panel privado: las páginas públicas inexistentes conservan estado HTTP 404 en lugar de devolver una pantalla 404 dentro de un stream 200.
- Eliminación de medios condicionada de forma atómica a que el registro siga sin referencias antes de retirar el objeto de Storage.
- Dependencias de lint sustituidas por una combinación mantenida y compatible; auditoría final sin vulnerabilidades.

## No verificado contra servicios externos

Faltan credenciales de Supabase y OpenAI. Por tanto, no se afirma haber probado login/logout real, entrega de correo de recuperación, carga/descarga contra Storage real, guardado de contactos remotos, respuesta OpenAI real ni despliegue en Vercel. Las políticas se probaron con PGlite y un esquema mínimo de Auth/Storage; el flujo real debe completarse con [la lista manual](PRUEBAS-MANUALES.md).

GitHub CLI está instalado pero `gh auth status` indica que no hay sesión iniciada. No existe un remoto configurado para este trabajo y no se subió código a GitHub. No se crearon servicios remotos ni recursos de pago. Los servidores usados en la revisión son exclusivamente locales.
