import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'placeholder-key';

const memoryStore: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    } catch {}
    try {
      const val = sessionStorage.getItem(key);
      if (val !== null) return val;
    } catch {}
    return memoryStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    try { localStorage.setItem(key, value); return; } catch {}
    try { sessionStorage.setItem(key, value); return; } catch {}
    memoryStore[key] = value;
  },
  removeItem: (key: string): void => {
    try { localStorage.removeItem(key); } catch {}
    try { sessionStorage.removeItem(key); } catch {}
    delete memoryStore[key];
  },
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export const isSupabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
