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
    }
};
