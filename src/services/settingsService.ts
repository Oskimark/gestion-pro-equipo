import { supabase } from '@/lib/supabase';
import { ClubSettings } from '@/types';

export const settingsService = {
    async getSettings(): Promise<ClubSettings> {
        const { data, error } = await supabase
            .from('club_settings')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            // If table is empty or error occurs, return defaults
            if (error.code === 'PGRST116') {
                return { id_card_alert_days: 30, health_card_alert_days: 30 };
            }
            console.error('Error fetching settings:', error);
            // Default fallback
            return { id_card_alert_days: 30, health_card_alert_days: 30 };
        }

        return data as ClubSettings;
    },

    async updateSettings(settings: Partial<ClubSettings>): Promise<ClubSettings | null> {
        // Find existing record first
        const { data: existing } = await supabase
            .from('club_settings')
            .select('id')
            .limit(1)
            .single();

        if (existing?.id) {
            // Update
            const { data, error } = await supabase
                .from('club_settings')
                .update({ ...settings, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Insert initial
            const { data, error } = await supabase
                .from('club_settings')
                .insert([{ ...settings, updated_at: new Date().toISOString() }])
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    }
};
