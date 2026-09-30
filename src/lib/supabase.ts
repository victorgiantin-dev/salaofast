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

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SCRIPT SQL PARA O SUPABASE - SALÃO FAST
-- Copie e cole este código no SQL Editor do seu projeto Supabase
-- ==========================================

-- 1. Tabela de Perfis de Usuários (Clientes, Funcionários e Administrador)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'client')),
  phone TEXT,
  specialty TEXT, -- Especialidade do funcionário (ex: Cabeleireiro, Manicure)
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Serviços do Salão
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  image TEXT,
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Agendamentos dos Clientes
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
  service_price NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancellation_requested', 'cancelled', 'completed')),
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Horários Bloqueados pelos Funcionários
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) opcional
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para demonstração/integração direta anon:
CREATE POLICY "Permitir leitura anonima de servicos" ON public.services FOR SELECT USING (true);
CREATE POLICY "Permitir leitura e escrita de agendamentos" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Permitir leitura e escrita de horarios bloqueados" ON public.blocked_slots FOR ALL USING (true);
CREATE POLICY "Permitir leitura de perfis" ON public.profiles FOR ALL USING (true);
`;
