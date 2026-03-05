import { supabase } from '@/lib/supabase';
import { Payment } from '@/types';

export const paymentService = {
    async getPaymentsByPlayer(playerId: string): Promise<Payment[]> {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('player_id', playerId)
            .order('due_date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getAllPayments(): Promise<Payment[]> {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                player:players(id, full_name, photo_url)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async addPayment(payment: Partial<Payment>): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .insert([payment])
            .select()
            .single();

        if (error) throw error;

        // Optionally update player status here or via DB Trigger
        return data;
    },

    async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
        const { data, error } = await supabase
            .from('payments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deletePayment(id: string): Promise<void> {
        const { error } = await supabase
            .from('payments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
