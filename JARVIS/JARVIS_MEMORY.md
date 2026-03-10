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
    - Implementada tabla `match_responses` y lógica de servicios.
    - Dashboard: Botón "Iniciar Convocatoria" y contador dinámico de "Disponibles".
    - Portal Público: Página `/public/convocatoria/[token]` para confirmación de padres.
    - Impresión: "Lista de Buena Fe" ahora filtra por jugadores que confirmaron asistencia.

## Próximos Pasos
- **WhatsApp Masivo**: Integrar el botón "Iniciar Convocatoria" con la API de Twilio para enviar mensajes automáticos.
- **Sincronización Final**: Validar flujos con datos reales en el entorno de producción.
