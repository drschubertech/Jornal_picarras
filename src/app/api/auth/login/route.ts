import { isSupabaseConfigured } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return Response.json(
      { error: 'Supabase não configurado. Preencha o .env.local.' },
      { status: 503 },
    );
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return Response.json(
      { error: 'Informe e-mail e senha.' },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return Response.json(
      { error: 'E-mail ou senha inválidos.' },
      { status: 401 },
    );
  }

  return Response.json({ ok: true });
}
