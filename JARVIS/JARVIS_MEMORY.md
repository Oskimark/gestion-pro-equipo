# JARVIS Memory: Estado del Proyecto

## Estado Actual: Notificaciones Automáticas
- **Meta**: Optimizar el sistema de alertas de vencimiento de documentos y pagos.
- **Twilio**: Sandbox vinculado y funcionando. Se utiliza la API de WhatsApp para enviar notificaciones automáticas y manuales.
- **Últimos Avances**: 
    - Implementada la unificación de columnas en la tabla de jugadores (Dorsal embebido en la foto).
    - Configuración de cron personalizable (hora y días, horario Uruguay).
    - Sistema de limpieza de historial de notificaciones.
    - Implementación de columna "Habilitado" en tabla de jugadores y Dashboard (Cédula + Ficha Médica al día).
    - Botón de notificación individual (Campana) directo desde la gestión de jugadores.
    - Implementación de "Lista de Buena Fe" imprimible desde el Dashboard con filtros de habilitación/disponibilidad.
    - **Optimización UI/Mobile**: Layout de jugadores rediseñado para celulares (nombres envolventes y fila de acciones deslizable). Imágenes optimizadas en Pagos.

## Estado Actual: Módulo de Convocatorias
- **Meta**: Gestionar invitaciones a partidos y tracking de disponibilidad en tiempo real.
- **Logros**: 
    - **Custom WhatsApp Templates**: Implementada sección en Configuración para editar el mensaje de convocatoria con variables dinámicas ($JUGADOR, $RIVAL, $FECHA, $MAPA, $LINK).
    - **Map Picker Integration**: Selector visual de mapas (Leaflet) integrado en los formularios de Nuevo/Editar Partido para generar automáticamente el enlace de Google Maps.
    - **Free-form API**: La API de invitación (`/api/matches/invite`) ahora envía mensajes de texto libre, permitiendo personalización total sin depender de plantillas pre-aprobadas de Twilio.
    - **Uruguay Timezone**: Formateo automático de fechas y horas para Uruguay (GMT-3) en todas las notificaciones.
    - **Portal Público**: Página `/public/convocatoria/[token]` con instrucciones adicionales para confirmación de asistencia.

## Próximos Pasos
- **Control de Respuestas**: Mejorar la visualización del listado de respuestas en el detalle del partido.
- **Estadísticas**: Vincular los resultados de los partidos con el desempeño individual de los jugadores automáticamente.
- **Validación Final**: Asegurar que los mensajes de texto libre no superen los límites de caracteres de WhatsApp.
