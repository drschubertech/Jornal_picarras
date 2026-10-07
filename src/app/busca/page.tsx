import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchArticles } from '@/lib/articles';
import { ArticleCard } from '@/components/site/ArticleCard';
import { EmptyState, SetupNotice } from '@/components/site/Bits';
import { SearchForm } from '@/components/site/SearchForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Busca',
  description: 'Busque matérias publicadas pelo jornal.',
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const term = (q ?? '').trim();

  const { items, ok } = term
    ? await fetchArticles({ q: term, limit: 48 })
    : { items: [], ok: true };

  if (!ok) return <SetupNotice />;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-10">
      <header className="border-b-2 border-ink pb-4">
        <p className="eyebrow text-brand">Arquivo</p>
        <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-4xl font-black text-ink">
          Busca
        </h1>
      </header>

      <div className="mt-6">
        <Suspense>
          <SearchForm />
        </Suspense>
      </div>

      {term ? (
        <>
          <p className="mt-6 text-sm text-ink-3">
            {items.length} resultado(s) para{' '}
            <strong className="text-ink">“{term}”</strong>
          </p>

          {items.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Nada encontrado"
                description="Tente outros termos, como o nome de uma rua, da cidade ou de uma instituição da região."
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {items.map((article) => (
                <ArticleCard key={article.id} article={article} variant="story" />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="mt-6 font-[family-name:var(--font-serif)] text-lg text-ink-2">
          Digite um termo para pesquisar nas matérias publicadas.
        </p>
      )}
    </div>
  );
}
