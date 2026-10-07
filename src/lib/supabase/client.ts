import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from '@/lib/types';

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase não configurado: preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local',
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
