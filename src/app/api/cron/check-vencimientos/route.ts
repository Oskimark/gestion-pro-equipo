import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { settingsService } from '@/services/settingsService';
import { twilioService } from '@/services/twilioService';
import { getDocStatus } from '@/utils/playerUtils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // 1. Security Check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Get Settings
        const settings = await settingsService.getSettings();

        // 2.5 Check Schedule (Unless manual override)
        const url = new URL(request.url);
        const isManual = url.searchParams.get('manual') === 'true';

        if (!isManual) {
            const nowUy = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Montevideo" }));
            const currentDay = nowUy.toLocaleString("en-US", { weekday: 'long' }); // Monday, Tuesday...
            const currentHour = nowUy.getHours();
            const currentMinute = nowUy.getMinutes();

            const configDays = settings.cron_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const [configHour, configMinute] = (settings.cron_hour || '09:00').split(':').map(Number);

            const isDayActive = configDays.includes(currentDay);
            const isHourActive = currentHour === configHour;

            // Allow a small window (e.g., 59 minutes) since cron might run once an hour
            if (!isDayActive || !isHourActive) {
                return NextResponse.json({
                    success: true,
                    skipped: true,
                    reason: `Not scheduled for ${currentDay} at ${currentHour}:${currentMinute}. Config: ${configDays.join(',')} at ${configHour}:${configMinute} (UY Time)`
                });
            }
        }

        const alertDays = {
            id_card: settings.id_card_alert_days || 30,
            health_card: settings.health_card_alert_days || 30,
            permit: 30
        };

        // 3. Fetch Players with their notification preferences
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('*');

        if (playersError) throw playersError;

        const results = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const player of players) {
            const notificationsToSend = [];

            // Check ID Card
            if (player.notify_id_card !== false && player.id_card_expiry) {
                const status = getDocStatus(player.id_card_expiry, alertDays.id_card, player.id_card_rev_status);
                if (status.label === 'Vencido' || status.label === 'Por vencer') {
                    notificationsToSend.push({ type: 'Cédula de Identidad', status: status.label.toLowerCase() });
                }
            }

            // Check Health Card
            if (player.notify_health_card !== false && player.health_card_expiry) {
                const status = getDocStatus(player.health_card_expiry, alertDays.health_card, player.health_card_rev_status);
                if (status.label === 'Vencido' || status.label === 'Por vencer') {
                    notificationsToSend.push({ type: 'Ficha Médica', status: status.label.toLowerCase() });
                }
            }

            // Check Permit
            if (player.notify_permit !== false && player.permit_expiry) {
                const status = getDocStatus(player.permit_expiry, alertDays.permit);
                if (status.label === 'Vencido' || status.label === 'Por vencer') {
                    notificationsToSend.push({ type: 'Permit de Menor', status: status.label.toLowerCase() });
                }
            }

            // 4. Send WhatsApp if there are alerts
            if (notificationsToSend.length > 0) {
                const phone = player.referent_phone || player.father_phone || player.mother_phone;
                if (phone) {
                    const docText = notificationsToSend.map(n => n.type).join(', ');
                    const statusText = notificationsToSend.map(n => n.status).join(', ');
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gestion-pro-equipo.vercel.app';
                    if (!process.env.NEXT_PUBLIC_APP_URL) {
                        console.warn('NEXT_PUBLIC_APP_URL not set, using fallback:', appUrl);
                    }
                    const formLink = `${appUrl}/public/docs/${player.access_token}`;

                    const templateSid = 'HX01f0bc7cd60a15ec3d3fb845aa4ac9c2';
                    const variables = {
                        "1": player.full_name,
                        "2": docText,
                        "3": statusText,
                        "4": formLink
                    };

                    try {
                        await twilioService.sendWhatsApp(phone, undefined, templateSid, variables);
                        results.push({ player: player.full_name, status: 'sent', phone });

                        // Log to database
                        await supabase.from('notification_logs').insert({
                            player_id: player.id,
                            player_name: player.full_name,
                            phone,
                            message_type: 'expiracion',
                            content_sid: templateSid,
                            variables,
                            status: 'sent'
                        });
                    } catch (err: any) {
                        console.error(`Error sending to ${player.full_name}:`, err);
                        results.push({
                            player: player.full_name,
                            status: 'error',
                            phone,
                            error: err.message || String(err)
                        });

                        // Log error to database
                        await supabase.from('notification_logs').insert({
                            player_id: player.id,
                            player_name: player.full_name,
                            phone,
                            message_type: 'expiracion',
                            content_sid: templateSid,
                            variables,
                            status: 'error',
                            error_message: err.message || String(err)
                        });
                    }
                } else {
                    results.push({ player: player.full_name, status: 'skipped', reason: 'No phone number found' });
                }
            }
        }

        return NextResponse.json({
            success: true,
            processed: players.length,
            notifications_sent: results.filter(r => r.status === 'sent').length,
            details: results
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
