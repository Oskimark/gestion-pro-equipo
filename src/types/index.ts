export type Player = {
  id: string;
  full_name: string;
  photo_url?: string;
  shirt_number?: number;
  birth_date?: string;
  position?: string;
  shirt_size?: string;
  short_size?: string;
  socks_size?: string;
  parent_names?: string;
  emergency_phones?: string;
  address?: string;
  medical_card_expiry?: string;
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
