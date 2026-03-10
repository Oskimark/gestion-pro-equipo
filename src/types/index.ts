export type Player = {
  id: string;
  full_name: string;
  photo_url?: string;
  shirt_number?: number;
  birth_date?: string;
  position?: string;

  // Gear (Indumentaria)
  shirt_size?: string;
  short_size?: string;
  socks_size?: string;
  long_jersey_size?: string;
  long_shorts_size?: string;
  jacket_size?: string;
  shoe_size?: string;

  // Contact (Contacto)
  father_name?: string;
  father_phone?: string;
  mother_name?: string;
  mother_phone?: string;
  referent_name?: string;
  referent_phone?: string;
  address?: string;

  // Documents (Documentos - replace health section)
  id_card_num?: string;
  id_card_expiry?: string;
  id_card_url?: string;
  id_card_back_url?: string;
  health_card_expiry?: string;
  health_card_url?: string;
  permit_info?: string;
  permit_expiry?: string;
  health_insurance?: string;
  allergies?: string;
  id_card_notified_count?: number;
  health_card_notified_count?: number;

  // Notification Preferences
  notify_id_card?: boolean;
  notify_health_card?: boolean;
  notify_permit?: boolean;

  // New Revision fields
  access_token?: string;
  id_card_rev_url?: string;
  id_card_rev_back_url?: string;
  id_card_rev_expiry?: string;
  health_card_rev_url?: string;
  health_card_rev_expiry?: string;
  id_card_rev_status?: 'none' | 'pending' | 'approved' | 'rejected';
  health_card_rev_status?: 'none' | 'pending' | 'approved' | 'rejected';

  // Payments Status
  fee_status?: 'up_to_date' | 'behind';
  gear_status?: 'pending' | 'paid' | 'delivered';

  created_at: string;
};

export type Payment = {
  id: string;
  player_id: string;
  amount: number;
  category: 'Cuota Club' | 'Indumentaria' | 'Recaudación' | 'Extra' | 'Pago Anual';
  status: 'Pagado' | 'Pendiente';
  period_month?: number; // 1-12
  period_year?: number;
  due_date: string;
  paid_date?: string;
  notes?: string;
  player?: Player;
};

export type Match = {
  id: string;
  date: string;
  rival: string;
  venue?: string;
  score_home?: number;
  score_away?: number;
  status: 'Próximo' | 'Finalizado';
};

export type PlayerStats = {
  id: string;
  match_id: string;
  player_id: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
};

export type UserProfile = {
  id: string;
  role: 'admin' | 'ayudante' | 'visitante';
  full_name?: string;
  phone?: string;
  observations?: string;
  is_online?: boolean;
  status?: 'active' | 'suspended';
  last_seen?: string;
};

export type ClubSettings = {
  id?: string;
  id_card_alert_days: number;
  health_card_alert_days: number;
  wa_send_form_link?: boolean;
  wa_custom_text_enabled?: boolean;
  wa_custom_text?: string;
  wa_payment_text?: string;

  // Payments Config
  monthly_fee: number;
  annual_fee: number;
  annual_discount_percent: number;
  gear_price: number;

  // Cron Scheduling
  cron_hour?: string; // e.g., "09:00"
  cron_days?: string[]; // e.g., ["Monday", "Wednesday"]

  updated_at?: string;
};

export type NotificationLog = {
  id: string;
  player_id?: string;
  player_name?: string;
  phone: string;
  message_type: string;
  content_sid?: string;
  variables?: any;
  status: 'sent' | 'error' | 'delivered' | 'read';
  error_message?: string;
  created_at: string;
};

export type MatchResponse = {
  id: string;
  match_id: string;
  player_id: string;
  status: 'asiste' | 'no_asiste' | 'pendiente';
  confirmed_at?: string;
  updated_at: string;
};
