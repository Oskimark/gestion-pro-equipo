# Configuración Técnica

## Twilio (WhatsApp)
- **Account SID**: Configurado como variable de entorno `TWILIO_ACCOUNT_SID`.
- **Auth Token**: Configurado como variable de entorno `TWILIO_AUTH_TOKEN`.
- **Número Sandbox**: `+14155238886` (Standard Twilio Sandbox).
- **Template SID Actual**: `HX01f0bc7cd60a15ec3d3fb845aa4ac9c2`
    - *Variables*: 
        - `{{1}}`: Nombre del Jugador
        - `{{2}}`: Documentos (ej: Ficha Médica)
        - `{{3}}`: Estado (ej: vencida)
        - `{{4}}`: Enlace de autogestión

## Backend & Cron
- **Endpoint de Cron**: `/api/cron/check-vencimientos`
- **Manual Override**: `/api/cron/check-vencimientos?manual=true`
- **Secret**: Variable de entorno `CRON_SECRET`.
- **Base de Datos**: Supabase (Tablas: `players`, `club_settings`, `notification_logs`).

## Supabase RLS
- Se requiere política `SELECT` para `anon` en `players` usando `access_token` para el formulario público.
