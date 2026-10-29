# Verificación con Supabase de desarrollo

La suite automática ejecuta las políticas reales sobre PostgreSQL embebido con un esquema mínimo que emula Auth y Storage. No reemplaza las pruebas del servicio Auth, el proveedor Storage ni la API Gemini.

1. Crear un administrador y un usuario sin rol. Login correcto del admin, rechazo del usuario sin rol, rechazo de contraseña errónea. Cerrar sesión y volver a una URL administrativa: debe redirigir al login.
2. Solicitar recuperación, abrir el correo, actualizar contraseña de 12+ caracteres y volver a entrar. Probar enlace caducado.
3. Crear proyecto en borrador con dos enlaces y sin multimedia. Editar orden, título, slug y descripción. Confirmar rechazo de `javascript:`. Abrir vista previa privada y comprobar 404 público del slug.
4. Subir JPEG con alt; probar SVG, contenido falso y archivo >3 MB (rechazados). Asignar portada y dos imágenes con orden. Consultar su `/api/media/UUID` sin sesión: debe ser 404 mientras el proyecto esté en borrador.
5. Publicar. En ventana privada, abrir proyecto y archivos. Editar texto y recargar sin desplegar: deben verse los cambios. Despublicar: archivos y proyecto deben dejar de ser accesibles sin sesión.
6. Cambiar categoría, destacado y orden de proyectos. Probar filtros. Publicar servicio, experiencia, formación y testimonio con datos reales. Desactivar y reordenar secciones. Cambiar paleta y tipografía.
7. Subir PDF como CV y retrato general; comprobar publicación y descarga. Desvincular archivo, marcarlo privado y eliminarlo con confirmación. Rechazar borrado de archivo todavía usado.
8. Completar el aviso de privacidad. Enviar contacto válido después de 3 s: confirmar fila en `/admin/contactos`, cambiar pendiente/atendido. Verificar que un cliente anónimo no puede leer contactos ni crear registros directamente. Honeypot, falta de consentimiento y cuota excedida deben impedir guardado.
9. Sin clave Gemini: mensaje honesto de indisponibilidad. Con clave/modelo: preguntar servicios y proyectos, verificar enlaces. Desactivar asistente desde el panel. Probar límite diario 0, límite por visitante, clave inválida y timeout. Pedir borradores/datos privados: nunca deben formar parte del contexto ni aparecer en respuestas.
10. Navegar con Tab, Enter y Escape en los controles aplicables, zoom 200%, móvil y tableta; verificar foco y ausencia de desplazamiento horizontal. Activar movimiento reducido en el sistema.
11. Revisar el título, descripción, imagen compartida y sitemap con contenido real. Revisar contraste de las tres paletas y textos alternativos.

Usar datos de prueba y eliminar los contactos desde Supabase al terminar según la política de conservación. No utilizar datos privados reales para probar prompts.
