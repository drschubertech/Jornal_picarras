import { fetchArticles } from '@/lib/articles';
import { SetupNotice } from '@/components/site/Bits';
import { ArticlesManager } from '@/components/admin/ArticlesManager';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { items, ok } = await fetchArticles({ status: 'all', limit: 100 });

  if (!ok) {
    return (
      <div className="grid gap-4">
        <SetupNotice />
        <p className="text-sm text-ink-2">
          Depois de configurar, crie o usuário de acesso em <strong>Supabase →
          Authentication → Users → Add user</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-5 font-[family-name:var(--font-playfair)] text-2xl font-black text-ink">
        Matérias
      </h1>
      <ArticlesManager initial={items} />
    </div>
  );
}
