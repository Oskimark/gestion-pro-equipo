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
        const alertDays = {
            id_card: settings.id_card_alert_days || 30,
            health_card: settings.health_card_alert_days || 30,
            permit: 30 // Default for permit if not in settings
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
                    const docText = notificationsToSend.map(n => `${n.type} (${n.status})`).join(', ');

                    let messageBody = '';
                    if (settings.wa_custom_text_enabled && settings.wa_custom_text) {
                        messageBody = settings.wa_custom_text
                            .replace('$jugador', player.full_name)
                            .replace('$documento', docText)
                            .replace('$estado', 'próximo a vencer/vencido');
                    } else {
                        messageBody = `Hola! Te escribimos de CLUB 33. Te avisamos que la documentación de ${player.full_name} requiere atención: ${docText}.`;
                    }

                    if (settings.wa_send_form_link) {
                        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gestion-pro-equipo.vercel.app';
                        messageBody += `\n\nPuedes subir los documentos aquí: ${baseUrl}/public/docs/${player.access_token}`;
                    }

                    try {
                        await twilioService.sendWhatsApp(phone, messageBody);
                        results.push({ player: player.full_name, status: 'sent', phone });
                    } catch (err) {
                        console.error(`Error sending to ${player.full_name}:`, err);
                        results.push({ player: player.full_name, status: 'error', error: String(err) });
                    }
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
