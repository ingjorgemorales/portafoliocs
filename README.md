# Portafolio editorial · Comunicación social

Aplicación en español con web pública, administración privada y asistente virtual. Construida para desarrollo local y despliegue posterior en Vercel, con Supabase como proveedor de datos, autenticación y archivos.

## Ejecutar en tu computador

Requiere Node.js 24 y npm. Desde `C:\laragon\www\portafoliocs`:

```powershell
npm ci
Copy-Item .env.example .env.local  # solo si todavía no existe
npm run dev
```

Abre [localhost:3000](http://localhost:3000). No se necesita Apache, PHP ni MySQL de Laragon. En esta entrega ya hay un `.env.local` **ignorado por Git** que activa la demostración local sin secretos. El panel de demostración se puede inspeccionar en [/admin](http://localhost:3000/admin); no permite guardar ni simula usuarios o persistencia.

El modo demo solo funciona durante desarrollo, sin Supabase configurado y con `DEMO_MODE=true`. Está bloqueado en producción. Los ejemplos no se insertan en la base de datos y no representan trabajo, clientes, experiencia ni testimonios reales. Sustituye el nombre, las imágenes y los textos desde el panel al conectar Supabase.

## Funcionalidades implementadas

- Diseño editorial adaptable, tres paletas y tres combinaciones tipográficas. Fuentes alojadas con la aplicación, iconos Lucide, Motion respetando movimiento reducido, controles de teclado y foco visible.
- Inicio, sobre mí, habilidades, servicios desplegables, portafolio filtrable, detalle de proyectos, trayectoria, formación, testimonios, CV, contacto y asistente. Secciones vacías se ocultan; orden y visibilidad editables. Navegación ligada a secciones disponibles.
- Todas las rutas administrativas solicitadas. CRUD editorial con orden, borradores, publicación, destacados, Tiptap, etiquetas y SEO. Previsualización privada de proyectos. Hipervínculos múltiples ordenables con validación de protocolos y protección de enlaces externos.
- Auth de Supabase con recuperación y cierre de sesión. Verificación de usuario y rol en cada operación del servidor, más RLS. Sin registro público ni mecanismo para autoasignarse permisos.
- Migración relacional para configuración, secciones, categorías, proyectos, enlaces, medios, servicios, experiencia, formación, testimonios, FAQs, fuentes y contactos. Restricciones, índices y fechas de auditoría. Los detalles editoriales específicos usan JSONB validado; las relaciones y permisos están en tablas SQL.
- Storage privado: validación de archivos y firma binaria, UUID, alt, uso, asociación y orden. Los archivos heredan la publicación del proyecto; despublicar revoca lectura posterior. Se transmiten mediante un endpoint sujeto a RLS y sin caché pública. Eliminación limitada a objetos sin referencias.
- Formulario con React Hook Form y Zod en cliente/servidor, honeypot, tiempo mínimo, consentimiento, versión del aviso y límites atómicos en Postgres. Bandeja privada con estados pendiente/atendido.
- OpenAI Responses exclusivamente en servidor, modelo por variable de entorno, contexto público leído con cliente anónimo, sin historial persistido, timeout, límites de entrada/salida y cuotas distribuidas. El panel gestiona tono, bienvenida, activación, FAQ y fuentes autorizadas. Las fuentes externas se incorporan mediante resumen editorial; no hay scraping ni RAG complejo.
- Renderizado dinámico y revalidación al guardar, sin despliegue para cambios de contenido. Metadata de proyectos y sitio, imagen social configurable, sitemap y robots que excluyen administración/API.
- `.env.example`, guía de instalación y despliegue, pruebas y flujo de CI de GitHub.

## Configurar servicios reales

Sigue [docs/CONFIGURACION.md](docs/CONFIGURACION.md) para:

1. Crear o seleccionar **Supabase de desarrollo**, aplicar la migración y crear el primer administrador de forma segura.
2. Completar URL, publishable key y service role en `.env.local`.
3. Configurar `RATE_LIMIT_SECRET`, `OPENAI_API_KEY`, `OPENAI_MODEL` y límite diario.
4. Configurar Auth, recuperación, alternativa de Supabase local con Docker, GitHub, Vercel y dominio.

No compartas claves secretas en chats ni commits. El aviso de privacidad y los canales de contacto deben completarse antes de habilitar el formulario. Las notificaciones por correo de nuevos contactos son una integración opcional no activada.

## Calidad y pruebas

```powershell
npm run lint
npm run typecheck
npm test
npm run build
# Con npm run dev activo en otro terminal:
npm run test:smoke
```

La suite incluye siete pruebas de validación/sanitización y una prueba de integración PostgreSQL con múltiples escenarios: migración, lectura anónima, usuario sin rol, administrador, escalamiento de rol bloqueado, contactos privados, archivos de borradores, publicación/despublicación, guardado transaccional con múltiples enlaces, rollback y cuotas persistentes. Usa PGlite en memoria y esquemas mínimos de Auth/Storage; no crea recursos externos.

Los smoke tests recorren todas las rutas del panel, páginas públicas y errores de API sin credenciales. Para comprobar producción sin Supabase: ejecuta `npm run build`, `npm run start -- --port 3001` y `node scripts/smoke.mjs --production`. Este modo verifica además que la demo se desactiva y `/admin` redirige al login.

Consulta [docs/VERIFICACION.md](docs/VERIFICACION.md) para resultados de esta entrega y [docs/PRUEBAS-MANUALES.md](docs/PRUEBAS-MANUALES.md) para los flujos que necesitan tus credenciales.

## Estructura

```text
src/app/                  Rutas públicas, administración, acciones y API
src/components/           Interfaz pública, editores y componentes shadcn/ui
src/lib/                  Esquemas, sanitización, contenido, cuotas y Supabase
src/proxy.ts              Renovación de cookies de sesión
supabase/migrations/      Esquema, RLS, Storage y funciones transaccionales
tests/                    Validación y pruebas SQL de permisos
scripts/smoke.mjs          Comprobación HTTP de desarrollo/producción
docs/                     Configuración y verificación
.github/workflows/ci.yml   Lint, pruebas, build y tipos
```

Se utiliza el patrón de Button de shadcn/ui (Radix Slot, CVA y utilidades), adaptado al sistema visual. `components.json` permite incorporar más componentes. ESLint 10 usa reglas mantenidas de TypeScript y React Hooks; se evita `eslint-config-next` por sus dependencias incompatibles con ESLint 10 y las alertas de seguridad detectadas durante la instalación. La versión compatible de `@hookform/resolvers` está fijada por el lockfile.

## Pendientes externos reales

- Conectar Supabase y comprobar login/recuperación, persistencia y Storage contra el servicio real.
- Configurar OpenAI y verificar una respuesta real y los límites con el modelo elegido.
- Sustituir marcadores por contenido profesional y aprobar el aviso de privacidad.
- Autenticar GitHub CLI y elegir/crear el repositorio remoto para subir el código. Git está inicializado localmente; no se ha subido el repositorio.
- Desplegar en Vercel y configurar dominio únicamente cuando se solicite. No se ha publicado en producción ni creado recursos de pago.
