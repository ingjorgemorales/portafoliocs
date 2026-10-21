# Configuración reproducible

## Supabase de desarrollo

1. Crea o selecciona un proyecto exclusivo de desarrollo. No reutilices la base futura de producción.
2. En SQL Editor ejecuta `supabase/migrations/202610210001_initial.sql` completo, una sola vez, en una base nueva. Con Supabase CLI puedes usar `supabase link --project-ref TU_REF` y `supabase db push` después de verificar el proyecto seleccionado.
3. Obtén Project URL y la clave **publishable** en Project Settings → API Keys. La clave `service_role` solo se usa en el servidor para guardar contactos y consumir cuotas. Nunca la pongas en una variable `NEXT_PUBLIC_*`.
4. Copia `.env.example` a `.env.local` y completa las variables. Establece `DEMO_MODE=false`. Reinicia `npm run dev`.
5. En Auth desactiva **Allow new users to sign up**. No hay formulario ni endpoint de registro en la aplicación.
6. Configura Site URL `http://localhost:3000` y agrega `http://localhost:3000/auth/callback` a Redirect URLs.
7. Crea el primer usuario en Auth → Users → Add user, con correo propio y contraseña fuerte. Copia su UUID. En SQL Editor, con privilegios del propietario:

```sql
insert into public.administrators(user_id)
values ('UUID_DEL_USUARIO');
```

La app no permite escribir en esa tabla. Un usuario normal no puede asignarse el rol; los metadatos de usuario tampoco otorgan permisos. No incluyas claves secretas en comandos de consola ni commits. Para retirar acceso, elimina su fila de `administrators` y revoca sus sesiones desde Supabase Auth.

8. Accede a `/admin/login`. Completa perfil, contacto y aviso de privacidad antes de habilitar el formulario público. El aviso debe especificar responsable, finalidad, plazo de conservación y canal para solicitar acceso o eliminación de datos, adaptado al uso real. El texto legal final lo proporciona el responsable del sitio.
9. Publica una categoría y un proyecto. Los registros nacen en borrador. Asocia los archivos desde Multimedia; para portada usa “Portada de proyecto”. Para fotografía, CV y tarjeta social, selecciona “Sin proyecto”, el uso correspondiente y publicación habilitada.

## Alternativa local con Docker

Instala Docker Desktop y Supabase CLI siguiendo su documentación oficial. Desde esta carpeta:

```powershell
npx supabase init
npx supabase start
npx supabase db reset
npx supabase status
```

`db reset` destruye **solo la base local** del proyecto: úsalo únicamente para desarrollo sin datos que conservar. La migración versionada se ejecuta automáticamente. Copia las URL y claves locales que muestre `status` a `.env.local`. Crea el usuario y rol desde Studio local, igual que arriba. Auth local entrega correos al buzón de pruebas que muestra `supabase status`. No uses estas claves en producción. No se ha iniciado Docker ni creado un proyecto remoto automáticamente.

## OpenAI

Configura `OPENAI_API_KEY` de un proyecto dedicado y `OPENAI_MODEL` con un identificador vigente, disponible en tu cuenta y compatible con Responses. La aplicación no fija un modelo por defecto.

- `AI_DAILY_REQUEST_LIMIT` limita llamadas globales por día UTC; `0` apaga el consumo.
- Máximo 8 consultas/hora por identificador de visitante, 1000 caracteres por pregunta, 24 000 caracteres de contexto y 650 tokens de salida por solicitud. Cada consulta es independiente; no se conserva historial entre peticiones.
- Se reservan cuotas en Postgres antes de llamar al proveedor, incluso si luego falla. El límite diario, el contexto acotado y los tokens de salida acotan el gasto, pero no equivalen a un límite monetario exacto: calcula el presupuesto con los precios del modelo y configura alertas/límites en tu proyecto OpenAI.
- Sin reintentos automáticos, timeout de 22 segundos y `store:false`. No se guardan conversaciones en la base. Esto no sustituye las políticas de retención del proveedor.
- Publica FAQs y fuentes autorizadas en Administración → Asistente IA. Las fuentes se usan por su resumen editorial; no se descargan URL externas ni se siguen enlaces.
- Las consultas de contexto usan siempre un cliente anónimo, nunca el cliente con sesión ni `service_role`.

Genera un secreto aleatorio de 32 o más caracteres para `RATE_LIMIT_SECRET` con tu gestor de contraseñas. Se usa HMAC para no guardar IP en claro. En desarrollo hay una identidad local compartida. En producción se exige Vercel y `TRUSTED_PROXY=vercel`; fuera de ese entorno, implementa un adaptador de proxy confiable antes de habilitar formularios/IA. No se confía en cabeceras reenviadas arbitrarias.

## Archivos

Todos los uploads se guardan en el bucket privado `portfolio`. No se usa el disco de Next.js para persistencia. El límite de la app es 3 MB por archivo para mantenerse por debajo del límite de cuerpo de las funciones de Vercel; el bucket tiene un límite adicional de 20 MB. Para videos y audio pesado utiliza hipervínculos.

La app acepta JPEG, PNG, WebP, PDF, MP3 y WAV, comprueba tamaño, nombre, MIME y firma binaria y genera rutas UUID. No acepta SVG, HTML ni ejecutables. Una comprobación de firma no es un antivirus; para recibir archivos de terceros en el futuro, añade cuarentena y análisis antes de publicarlos. Actualmente solo administradores autorizados pueden subir archivos.

Los archivos de proyectos heredan su publicación. El endpoint `/api/media/[id]` verifica RLS antes de descargar y transmitir el objeto; usa `private, no-store`. Los borradores no generan URLs públicas permanentes ni pasan por una caché de imágenes pública. No se necesitan URLs firmadas para este flujo porque el proxy autentica cada solicitud. Los visitantes que ya descargaron un archivo publicado conservan su copia.

Para borrar un archivo: desvincúlalo del proyecto, selecciona “Galería / archivo”, desactiva su publicación, guarda y luego elimina. Los proyectos con archivos vinculados no se eliminan hasta desvincularlos. Si una carga no consigue registrar metadatos, se intenta retirar el objeto creado; ante fallos de red revisa objetos sin registro desde Storage. No hay eliminación automática masiva.

## GitHub y Vercel (sin despliegue automático por este trabajo)

El repositorio no contiene `.env.local`. Para publicar el código en un repositorio privado vacío, si aún no hay remoto:

```powershell
git add .
git commit -m "Implementar portafolio editorial con Supabase"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

En Vercel importa el repositorio, selecciona Next.js, Node.js 24 y conserva `npm run build`. Configura las variables de `.env.example` con credenciales del **proyecto Supabase de producción separado**. Ejecuta la migración en producción y crea su administrador mediante el procedimiento anterior. `DEMO_MODE=false`; aunque se configure true, el código bloquea el modo demo con `NODE_ENV=production`.

`APP_URL` debe ser el origen HTTPS canónico (sin rutas). `TRUSTED_PROXY=vercel`. No incluyas secretos en prefijos `NEXT_PUBLIC_`. Para previews usa Supabase de desarrollo y valores propios; no uses producción ni dejes CORS/redirects abiertos con comodines.

Añade el dominio en Vercel → Domains y configura exactamente los registros DNS que Vercel indique. Actualiza `APP_URL`, Site URL en Supabase y Redirect URLs a `https://tu-dominio/auth/callback`. Usa un único origen canónico y redirige variantes hacia él. Comprueba recuperación de contraseña desde ese dominio. El correo de recuperación depende de la configuración SMTP y límites de Supabase; para uso real configura un remitente autorizado.

La aplicación renderiza contenido dinámicamente y revalida las rutas al guardar: la edición editorial no requiere nuevo despliegue. Cambiar variables de entorno o código sí requiere reiniciar o desplegar.

Notificaciones de contacto por correo: integración opcional todavía no activada. Los mensajes sí quedan en la bandeja privada de Supabase cuando se guarda correctamente; nunca se muestra confirmación antes de ese guardado.

## Fuentes técnicas consultadas

- [Next.js: instalación](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase: clientes SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs)
- [shadcn/ui: Next.js](https://ui.shadcn.com/docs/installation/next)
- [OpenAI: Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses)
