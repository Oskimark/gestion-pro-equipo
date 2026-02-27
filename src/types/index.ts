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
  health_card_expiry?: string;
  health_card_url?: string;
  permit_info?: string;
  permit_expiry?: string;
  health_insurance?: string;
  allergies?: string;

  created_at: string;
};

export type Payment = {
  id: string;
  player_id: string;
  amount: number;
  category: 'Cuota Social' | 'Indumentaria' | 'Recaudación';
  status: 'Pagado' | 'Pendiente';
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
  role: 'admin' | 'ayudante';
  full_name?: string;
};

export type ClubSettings = {
  id?: string;
  id_card_alert_days: number;
  health_card_alert_days: number;
  updated_at?: string;
};
