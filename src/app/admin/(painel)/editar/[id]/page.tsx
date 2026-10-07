import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, type Article } from '@/lib/types';
import { ArticleEditor } from '@/components/admin/ArticleEditor';
import { SetupNotice } from '@/components/site/Bits';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await loadArticle(id);
  return { title: article ? `Editar: ${article.title}` : 'Editar matéria' };
}

async function loadArticle(id: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) return null;
    return (data as Article) ?? null;
  } catch {
    return null;
  }
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const article = await loadArticle(id);
  if (!article) notFound();

  return (
    <div className="grid gap-6">
      <header className="border-b-2 border-ink pb-3">
        <p className="eyebrow text-brand">
          {article.source_type === 'ai'
            ? 'Gerada com IA · revisada pela redação'
            : 'Matéria manual'}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-black text-ink">
          Editar matéria
        </h1>
      </header>

      <ArticleEditor article={article} />
    </div>
  );
}
