import { LoginForm } from '@/components/admin/LoginForm';

export const metadata = { title: 'Entrar no painel' };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-[440px] flex-col justify-center px-4 py-16">
      <p className="eyebrow text-brand">Redação</p>
      <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl font-black text-ink">
        Painel do editor
      </h1>
      <p className="mt-2 text-sm text-ink-2">
        Entre com o e-mail e a senha criados no Supabase (Authentication →
        Users) para publicar matérias.
      </p>
      <div className="mt-6 border border-rule bg-paper-2 p-6">
        <LoginForm />
      </div>
    </div>
  );
}
