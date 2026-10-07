import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchArticles } from '@/lib/articles';
import { CATEGORIES, getCategory } from '@/lib/site';
import { ArticleCard } from '@/components/site/ArticleCard';
import { EmptyState, SetupNotice } from '@/components/site/Bits';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ categoria: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  if (!cat) return { title: 'Editoria não encontrada' };
  return {
    title: cat.label,
    description: `${cat.description} Notícias de Balneário Piçarras e região.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  if (!cat) notFound();

  const { items, ok } = await fetchArticles({ category: cat.slug, limit: 48 });
  if (!ok) return <SetupNotice />;

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <header className="border-b-2 border-ink pb-4">
        <p className="eyebrow text-brand">Editoria</p>
        <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-4xl font-black text-ink sm:text-5xl">
          {cat.label}
        </h1>
        <p className="mt-2 max-w-2xl font-[family-name:var(--font-serif)] text-lg text-ink-2">
          {cat.description}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title={`Sem matérias em ${cat.label} por enquanto`}
            description="Quando a redação publicar conteúdo nesta editoria, ele aparecerá aqui."
            action={{ href: '/admin', label: 'Criar matéria' }}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((article) => (
            <ArticleCard key={article.id} article={article} variant="story" />
          ))}
        </div>
      )}
    </div>
  );
}
