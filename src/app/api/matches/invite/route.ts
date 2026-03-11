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

        const results = [];
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://gestion-pro-equipo.vercel.app';

        // Template SID for Convocatoria (Assuming same structure or dynamic)
        // Note: Using a fixed template for now or a generic one if authorized.
        const templateSid = 'HX01f0bc7cd60a15ec3d3fb845aa4ac9c2';

        for (const player of players) {
            const phone = player.referent_phone || player.father_phone || player.mother_phone;
            if (!phone) {
                results.push({ player: player.full_name, status: 'skipped', reason: 'No phone' });
                continue;
            }

            const confirmLink = `${appUrl}/public/convocatoria/${player.access_token}`;
            const dateStr = new Date(match.date).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' });
            const timeStr = new Date(match.date).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });

            // Variables for Convocatoria Template
            // 1: Player Name
            // 2: Match Details (vs Rival, Date, Time)
            // 3: Status/Action (Convocatoria)
            // 4: Confirmation Link
            const variables = {
                "1": player.full_name,
                "2": `vs ${match.rival} (${dateStr} - ${timeStr} HS)`,
                "3": `¡Estás convocado!`,
                "4": confirmLink
            };

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
