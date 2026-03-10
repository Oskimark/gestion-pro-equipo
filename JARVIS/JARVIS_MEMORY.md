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

## Próximos Pasos
- **Módulo de Convocatorias**: Implementar sistema para iniciar partidos y enviar convocatorias. Padres confirmarán asistencia (Sí/No) mediante el link de autogestión.
- **Cálculo de Disponibilidad**: Automatizar el contador de "Disponibles" del Dashboard usando las confirmaciones de asistencia (cruzando datos con jugadores habilitados).
- **Integración Final**: Sincronización de variables de entorno en Vercel.
