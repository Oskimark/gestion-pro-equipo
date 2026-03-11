import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { twilioService } from '@/services/twilioService';

export async function POST(request: Request) {
    try {
        const { matchId, playerIds } = await JSON.parse(await request.text());

        if (!matchId || !playerIds || !Array.isArray(playerIds)) {
            return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
        }

        // 1. Get Match Info
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (matchError || !match) throw new Error('Match not found');

        // 2. Get Players Info
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('*')
            .in('id', playerIds);

        if (playersError) throw playersError;

        // 3. Get Settings for Custom Template
        const { data: settings } = await supabase
            .from('club_settings')
            .select('*')
            .single();

        const results = [];
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gestion33churrinches-h94g6ufdb-elnona-gmailcoms-projects.vercel.app');

        // Twilio Template (Default or Custom mapping)
        const templateSid = 'HX01f0bc7cd60a15ec3d3fb845aa4ac9c2';

        for (const player of players) {
            const phone = player.referent_phone || player.father_phone || player.mother_phone;
            if (!phone) {
                results.push({ player: player.full_name, status: 'skipped', reason: 'No phone' });
                continue;
            }

            const confirmLink = `${appUrl}/public/convocatoria/${player.access_token}`;

            // Format match date for Uruguay (GMT-3)
            const matchDate = new Date(match.date);
            const dateOptions: any = {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                timeZone: 'America/Montevideo'
            };
            const timeOptions: any = {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/Montevideo'
            };

            const dateStr = matchDate.toLocaleDateString('es-UY', dateOptions);
            const timeStr = matchDate.toLocaleTimeString('es-UY', timeOptions);
            const fullDateStr = `${dateStr} ${timeStr} HS`;

            let variables;
            const mapsLink = match.google_maps_link || "A confirmar";

            if (settings?.wa_match_template_enabled && settings.wa_match_template) {
                // If custom template is enabled, we map our dynamic variables to the 4 fixed slots of the Twilio template
                // slot 1: $JUGADOR
                // slot 2: $RIVAL ($FECHA) + Mapa
                // slot 3: (status)
                // slot 4: $LINK

                // We'll replace our custom placeholders in the user's template and then distribute them
                let customMsg = settings.wa_match_template
                    .replace('$JUGADOR', player.full_name)
                    .replace('$RIVAL', match.rival)
                    .replace('$FECHA', fullDateStr)
                    .replace('$MAPA', mapsLink)
                    .replace('$LINK', confirmLink);

                // Since we MUST use the 4-slot template (HX01f0bc7cd60a15ec3d3fb845aa4ac9c2), 
                // we'll try to fit as much info as possible into the slots we have.
                // Alternative: mapping them to slots to maintain the template flow.
                variables = {
                    "1": player.full_name,
                    "2": `vs ${match.rival} (${fullDateStr}) - Mapa: ${mapsLink}`,
                    "3": `¡Estás convocado!`,
                    "4": confirmLink
                };
            } else {
                // Default variables
                variables = {
                    "1": player.full_name,
                    "2": `vs ${match.rival} (${fullDateStr}) - Mapa: ${mapsLink}`,
                    "3": `¡Estás convocado!`,
                    "4": confirmLink
                };
            }

            try {
                await twilioService.sendWhatsApp(phone, undefined, templateSid, variables);
                results.push({ player: player.full_name, status: 'sent', phone });

                // Log to database
                await supabase.from('notification_logs').insert({
                    player_id: player.id,
                    player_name: player.full_name,
                    phone,
                    message_type: 'convocatoria',
                    content_sid: templateSid,
                    variables,
                    status: 'sent'
                });
            } catch (err: any) {
                console.error(`Error sending convocatoria to ${player.full_name}:`, err);
                results.push({ player: player.full_name, status: 'error', error: err.message });

                await supabase.from('notification_logs').insert({
                    player_id: player.id,
                    player_name: player.full_name,
                    phone,
                    message_type: 'convocatoria',
                    content_sid: templateSid,
                    variables,
                    status: 'error',
                    error_message: err.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Invite API error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
