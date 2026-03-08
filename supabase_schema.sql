-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    photo_url TEXT,
    shirt_number INTEGER,
    birth_date DATE,
    position TEXT,
    shirt_size TEXT,
    short_size TEXT,
    socks_size TEXT,
    long_jersey_size TEXT,
    long_shorts_size TEXT,
    jacket_size TEXT,
    shoe_size TEXT,
    address TEXT,
    id_card_num TEXT,
    id_card_expiry DATE,
    id_card_url TEXT,
    id_card_back_url TEXT,
    health_card_expiry DATE,
    health_card_url TEXT,
    permit_info TEXT,
    permit_expiry DATE,
    health_insurance TEXT,
    allergies TEXT,
    id_card_notified_count INTEGER DEFAULT 0,
    health_card_notified_count INTEGER DEFAULT 0,
    id_card_rev_status TEXT DEFAULT 'none',
    health_card_rev_status TEXT DEFAULT 'none',
    id_card_rev_url TEXT,
    id_card_rev_back_url TEXT,
    id_card_rev_expiry DATE,
    health_card_rev_url TEXT,
    health_card_rev_expiry DATE,
    fee_status TEXT DEFAULT 'pending',
    gear_status TEXT DEFAULT 'pending',
    notify_id_card BOOLEAN DEFAULT true,
    notify_health_card BOOLEAN DEFAULT true,
    notify_permit BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL, -- 'Cuota Social', 'Indumentaria', 'Recaudación'
    status TEXT NOT NULL DEFAULT 'Pendiente', -- 'Pagado', 'Pendiente'
    period_month INTEGER,
    period_year INTEGER,
    due_date DATE NOT NULL,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    rival TEXT NOT NULL,
    venue TEXT,
    score_home INTEGER,
    score_away INTEGER,
    status TEXT DEFAULT 'Próximo', -- 'Próximo', 'Finalizado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player Stats table (Goals, etc.)
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles (for Admin/Helper roles)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT DEFAULT 'ayudante',
    full_name TEXT,
    phone TEXT,
    observations TEXT,
    status TEXT DEFAULT 'suspended', -- 'active', 'suspended'
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'ayudante', 'visitante'))
);

-- RLS (Row Level Security) - Simplista por ahora
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
-- 1. Función de seguridad para verificar admin (evita recursión)
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Políticas de la tabla Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Lectura: Todos ven a todos
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT TO authenticated USING (true);

-- Edición: Usuarios actualizan su propia presencia
CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Administración: Admins gestionan todo
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL TO authenticated USING (public.is_admin());

-- Notification Logs table
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    player_name TEXT,
    phone TEXT,
    message_type TEXT, -- 'expiracion'
    content_sid TEXT,
    variables JSONB,
    status TEXT DEFAULT 'sent', -- 'sent', 'error'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notification_logs_read_all" ON notification_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "notification_logs_admin_all" ON notification_logs FOR ALL TO authenticated USING (public.is_admin());
