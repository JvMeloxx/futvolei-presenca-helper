-- Migração para o banco Neon
-- Execute este SQL no seu banco Neon

-- Criar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de usuários (substituindo auth.users do Supabase)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  preferred_days TEXT[],
  preferred_times TEXT[],
  email_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de classes
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  instructor TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 16,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day, time)
);

-- Criar tabela de confirmações de aula
CREATE TABLE IF NOT EXISTS class_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

-- Criar tabela de perfis (compatibilidade com código existente)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  preferred_days TEXT[],
  preferred_times TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_class_confirmations_user_id ON class_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_class_confirmations_class_id ON class_confirmations(class_id);
CREATE INDEX IF NOT EXISTS idx_classes_day_time ON classes(day, time);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Função para contar confirmações de uma aula
CREATE OR REPLACE FUNCTION get_class_confirmation_count(class_id TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM class_confirmations WHERE class_confirmations.class_id = $1);
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se usuário confirmou uma aula
CREATE OR REPLACE FUNCTION has_user_confirmed_class(user_id UUID, class_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM class_confirmations WHERE class_confirmations.user_id = $1 AND class_confirmations.class_id = $2);
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar dados entre users e profiles
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO profiles (id, full_name, avatar_url, preferred_days, preferred_times, created_at, updated_at)
    VALUES (NEW.id, NEW.full_name, NEW.avatar_url, NEW.preferred_days, NEW.preferred_times, NEW.created_at, NEW.updated_at);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE profiles SET
      full_name = NEW.full_name,
      avatar_url = NEW.avatar_url,
      preferred_days = NEW.preferred_days,
      preferred_times = NEW.preferred_times,
      updated_at = NEW.updated_at
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_sync_user_profile ON users;
CREATE TRIGGER trigger_sync_user_profile
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas aulas de exemplo (opcional)
INSERT INTO classes (id, day, time, location, instructor, max_participants) VALUES
('segunda-6h30', 'Segunda', '6h30', 'Quadra Principal', 'João Silva', 16),
('segunda-8h', 'Segunda', '8h', 'Quadra Principal', 'Maria Santos', 16),
('terca-18h30', 'Terça', '18h30', 'Quadra Principal', 'Pedro Costa', 16),
('quarta-20h', 'Quarta', '20h', 'Quadra Principal', 'Ana Lima', 16),
('quinta-17h', 'Quinta', '17h', 'Quadra Principal', 'Carlos Oliveira', 16)
ON CONFLICT (id) DO NOTHING;