# Configuración Técnica

## Twilio (WhatsApp)
- **Account SID**: Configurado como variable de entorno `TWILIO_ACCOUNT_SID`.
- **Auth Token**: Configurado como variable de entorno `TWILIO_AUTH_TOKEN`.
- **Número Sandbox**: `+14155238886` (Standard Twilio Sandbox).
- **Template SID Actual**: `HX01f0bc7cd60a15ec3d3fb845aa4ac9c2`
    - *Uso*: Solo para alertas automáticas de vencimiento de documentos y pagos.
    - *Variables*: 
        - `{{1}}`: Nombre del Jugador
        - `{{2}}`: Documentos (ej: Ficha Médica)
        - `{{3}}`: Estado (ej: vencida)
        - `{{4}}`: Enlace de autogestión

## Módulo de Convocatorias
- **Endpoint**: `/api/matches/invite` (POST)
- **Formato**: Free-form message (Texto libre). No requiere Template SID.
- **Variables Soportadas**: `$JUGADOR`, `$RIVAL`, `$FECHA`, `$MAPA`, `$LINK`.
- **Geocoding**: Utiliza `nominatim.openstreetmap.org` para búsquedas en el Map Picker.
- **Zona Horaria**: `America/Montevideo` (GMT-3) forzada en la lógica de servidor.

## Backend & Cron
- **Endpoint de Cron**: `/api/cron/check-vencimientos`
- **Manual Override**: `/api/cron/check-vencimientos?manual=true`
- **Secret**: Variable de entorno `CRON_SECRET`.
- **Base de Datos**: Supabase (Tablas: `players`, `club_settings`, `notification_logs`, `matches`, `match_responses`).

## Supabase RLS
- Se requiere política `SELECT` para `anon` en `players` usando `access_token`.
- Se requiere política `SELECT` para `anon` en `matches` y `match_responses` para el portal público.
