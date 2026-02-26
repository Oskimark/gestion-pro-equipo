import { supabase } from "@/lib/supabase";
import { Player } from "@/types";

export const playerService = {
    async getAll() {
        const { data, error } = await supabase
            .from("players")
            .select("*")
            .order("full_name", { ascending: true });

        if (error) throw error;
        return data as Player[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from("players")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data as Player;
    },

    async create(player: Omit<Player, "id" | "created_at">) {
        const { data, error } = await supabase
            .from("players")
            .insert([player])
            .select()
            .single();

        if (error) throw error;
        return data as Player;
    },

    async update(id: string, player: Partial<Omit<Player, "id" | "created_at">>) {
        const { data, error } = await supabase
            .from("players")
            .update(player)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Player;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from("players")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return true;
    }
};
