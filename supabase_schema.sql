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
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Poliza básica: Autenticados pueden leer todo
CREATE POLICY "Authenticated users can read all" ON players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON player_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read all" ON profiles FOR SELECT TO authenticated USING (true);

-- Poliza: Usuarios pueden actualizar su propia presencia
CREATE POLICY "Users can update own presence" ON profiles 
FOR UPDATE TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Poliza básica: Admin puede editar todo
CREATE POLICY "Admins can update players" ON players FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update payments" ON payments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update matches" ON matches FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update player_stats" ON player_stats FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update profiles" ON profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
-- ... repetir para otras tablas
