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
    parent_names TEXT,
    emergency_phones TEXT,
    address TEXT,
    medical_card_expiry DATE,
    health_insurance TEXT,
    allergies TEXT,
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
    role TEXT DEFAULT 'ayudante', -- 'admin', 'ayudante'
    full_name TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'suspended'
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- ... repetir para otras tablas
