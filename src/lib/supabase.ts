import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache for active client
let activeSupabaseClient: SupabaseClient | null = null;
let currentConfig = { url: '', anonKey: '' };

export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  if (!url || !anonKey) {
    const saved = localStorage.getItem('salao_fast_supabase_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        url = parsed.url;
        anonKey = parsed.anonKey;
      } catch (e) {
        console.error('Error parsing saved Supabase config:', e);
      }
    }
  }

  if (!url || !anonKey || !url.startsWith('https://')) {
    return null;
  }

  if (activeSupabaseClient && currentConfig.url === url && currentConfig.anonKey === anonKey) {
    return activeSupabaseClient;
  }

  try {
    activeSupabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    currentConfig = { url, anonKey };
    return activeSupabaseClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'URL e Chave Anon são obrigatórios.' };
  }
  if (!url.startsWith('https://')) {
    return { success: false, message: 'A URL do Supabase deve começar com https:// (ex: https://xyz.supabase.co)' };
  }

  try {
    // Ping the Supabase REST health/schema endpoint
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (response.ok || response.status === 200 || response.status === 404) {
      return {
        success: true,
        message: 'Conexão com o Supabase estabelecida com sucesso! API respondendo normalmente.',
      };
    } else {
      return {
        success: false,
        message: `Falha na autenticação com Supabase: Status HTTP ${response.status} (${response.statusText}). Verifique a chave Anon e URL.`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao conectar com ${url}: ${err?.message || 'Verifique se a URL está correta e com CORS habilitado.'}`,
    };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================
-- SCRIPT SQL COMPLETO PARA SUPABASE - SALÃO FAST
-- Inclui: Tabelas, Índices, RLS, Storage Buckets e Políticas de Armazenamento
-- Copie e cole este código no SQL Editor do seu projeto Supabase
-- ==============================================================

-- 1. TABELA DE PERFIS DE USUÁRIOS (Clientes, Funcionários e Administrador)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'client')),
  phone TEXT,
  specialty TEXT, -- Especialidade do funcionário (ex: Cabeleireiro, Manicure, Barbeiro)
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE SERVIÇOS DO SALÃO
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('todos', 'cabelo', 'barba', 'coloracao', 'estetica', 'unhas')),
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  image TEXT,
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE PRODUTOS HOME CARE DO SALÃO
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Fast Professional',
  category TEXT NOT NULL DEFAULT 'Geral',
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  volume TEXT DEFAULT '100ml',
  image TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE AGENDAMENTOS DOS CLIENTES
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancellation_requested', 'cancelled', 'completed')),
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GARANTIR COLUNAS EM TABELAS PRÉ-EXISTENTES (MIGRAÇÃO AUTOMÁTICA SEGURA)
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS client_phone TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS client_email TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS service_price NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS time TIME;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 45;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. TABELA DE HORÁRIOS BLOQUEADOS PELOS FUNCIONÁRIOS
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Bloqueio de Agenda',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.blocked_slots ADD COLUMN IF NOT EXISTS employee_id TEXT;
ALTER TABLE public.blocked_slots ADD COLUMN IF NOT EXISTS employee_name TEXT;
ALTER TABLE public.blocked_slots ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.blocked_slots ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE public.blocked_slots ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE public.blocked_slots ADD COLUMN IF NOT EXISTS reason TEXT;

-- GARANTIR COLUNAS EM PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ==============================================================
-- ÍNDICES DE PERFORMANCE PARA BUSCAS RÁPIDAS
-- ==============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_client ON public.appointments(client_id, client_email);
CREATE INDEX IF NOT EXISTS idx_appointments_employee ON public.appointments(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date, time);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_emp_date ON public.blocked_slots(employee_id, date);

-- ==============================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) NAS TABELAS
-- ==============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

-- Limpar políticas existentes se já houver
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "services_read_public" ON public.services;
DROP POLICY IF EXISTS "services_admin_modify" ON public.services;
DROP POLICY IF EXISTS "products_read_public" ON public.products;
DROP POLICY IF EXISTS "products_admin_modify" ON public.products;
DROP POLICY IF EXISTS "appointments_all_policy" ON public.appointments;
DROP POLICY IF EXISTS "blocked_slots_all_policy" ON public.blocked_slots;

-- Políticas para PROFILES
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_update_policy" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Políticas para SERVICES
CREATE POLICY "services_read_public" ON public.services FOR SELECT USING (true);
CREATE POLICY "services_admin_modify" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- Políticas para PRODUCTS
CREATE POLICY "products_read_public" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_modify" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Políticas para APPOINTMENTS
CREATE POLICY "appointments_all_policy" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- Políticas para BLOCKED SLOTS
CREATE POLICY "blocked_slots_all_policy" ON public.blocked_slots FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================
-- BUCKETS DE STORAGE (ARMAZENAMENTO DE ARQUIVOS E FOTOS)
-- ==============================================================
-- Cria os buckets de armazenamento no esquema storage se ainda não existirem:
-- 1. 'salon-media': fotos de serviços, cortes e produtos do salão
-- 2. 'avatars': fotos de perfil de funcionários e clientes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('salon-media', 'salon-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==============================================================
-- POLÍTICAS DE STORAGE (storage.objects)
-- O Supabase já possui RLS nativamente ativo em storage.objects.
-- ==============================================================

-- Limpar políticas anteriores se existirem
DROP POLICY IF EXISTS "Permitir visualizacao publica de salon-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload em salon-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualizacao em salon-media" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusao em salon-media" ON storage.objects;

DROP POLICY IF EXISTS "Permitir visualizacao publica de avatars" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload em avatars" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualizacao em avatars" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusao em avatars" ON storage.objects;

-- POLÍTICAS PARA O BUCKET 'salon-media' (Fotos dos serviços e produtos)
-- 1. Leitura pública de fotos de serviços e produtos
CREATE POLICY "Permitir visualizacao publica de salon-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'salon-media');

-- 2. Upload de novas imagens no bucket salon-media
CREATE POLICY "Permitir upload em salon-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'salon-media');

-- 3. Atualização de imagens no bucket salon-media
CREATE POLICY "Permitir atualizacao em salon-media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'salon-media')
WITH CHECK (bucket_id = 'salon-media');

-- 4. Exclusão de imagens no bucket salon-media
CREATE POLICY "Permitir exclusao em salon-media"
ON storage.objects FOR DELETE
USING (bucket_id = 'salon-media');

-- POLÍTICAS PARA O BUCKET 'avatars' (Fotos dos profissionais e clientes)
-- 1. Leitura pública de fotos de perfil
CREATE POLICY "Permitir visualizacao publica de avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. Upload de avatares
CREATE POLICY "Permitir upload em avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars');

-- 3. Atualização de avatares
CREATE POLICY "Permitir atualizacao em avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- 4. Exclusão de avatares
CREATE POLICY "Permitir exclusao em avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');
`;
