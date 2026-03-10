import { supabase } from "@/lib/supabase";
import { Match } from "@/types";

export const matchService = {
    async getAll() {
        const { data, error } = await supabase
            .from("matches")
            .select("*")
            .order("date", { ascending: true });

        if (error) throw error;
        return data as Match[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from("matches")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data as Match;
    },

    async create(match: Omit<Match, "id">) {
        const { data, error } = await supabase
            .from("matches")
            .insert([match])
            .select()
            .single();

        if (error) throw error;
        return data as Match;
    },

    async update(id: string, match: Partial<Omit<Match, "id">>) {
        const { data, error } = await supabase
            .from("matches")
            .update(match)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Match;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from("matches")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return true;
    },

    async getMatchResponses(matchId: string) {
        const { data, error } = await supabase
            .from("match_responses")
            .select("*")
            .eq("match_id", matchId);

        if (error) throw error;
        return data;
    },

    async updateMatchResponse(matchId: string, playerId: string, status: 'asiste' | 'no_asiste' | 'pendiente') {
        const { data, error } = await supabase
            .from("match_responses")
            .upsert({
                match_id: matchId,
                player_id: playerId,
                status,
                confirmed_at: status !== 'pendiente' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'match_id,player_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async initializeMatchResponses(matchId: string, playerIds: string[]) {
        const responses = playerIds.map(playerId => ({
            match_id: matchId,
            player_id: playerId,
            status: 'pendiente'
        }));

        const { data, error } = await supabase
            .from("match_responses")
            .upsert(responses, { onConflict: 'match_id,player_id' });

        if (error) throw error;
        return data;
    }
};
