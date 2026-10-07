'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Falha ao entrar.');
        return;
      }
      const redirect = searchParams.get('redirect') ?? '/admin';
      router.replace(redirect);
      router.refresh();
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
        E-mail
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-rule-2 bg-paper px-3 py-2.5 text-base text-ink focus:border-ink focus:outline-none"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
        Senha
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-rule-2 bg-paper px-3 py-2.5 text-base text-ink focus:border-ink focus:outline-none"
        />
      </label>

      {error && (
        <p className="border-l-4 border-brand bg-paper px-3 py-2 text-sm text-brand">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 bg-ink px-5 py-3 text-sm font-semibold tracking-wide text-paper uppercase transition-colors hover:bg-brand disabled:opacity-60"
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
