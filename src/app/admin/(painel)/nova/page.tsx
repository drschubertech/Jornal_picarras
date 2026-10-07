import Link from 'next/link';
import { Suspense } from 'react';
import { ArticleEditor } from '@/components/admin/ArticleEditor';
import { AiWizard } from '@/components/admin/AiWizard';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ aba?: string }>;
}

export default async function NewArticlePage({ searchParams }: Props) {
  const { aba } = await searchParams;
  const tab = aba === 'ia' ? 'ia' : 'manual';

  return (
    <div className="grid gap-6">
      <header className="border-b-2 border-ink pb-3">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-black text-ink">
          Nova matéria
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          Escreva manualmente com o editor completo ou deixe a IA pesquisar a
          internet e produzir a matéria para revisão.
        </p>
      </header>

      <nav className="flex gap-2 text-sm">
        <Link
          href="/admin/nova"
          className={`px-4 py-2 font-semibold transition-colors ${
            tab === 'manual'
              ? 'bg-ink text-paper'
              : 'border border-rule-2 text-ink-2 hover:border-ink hover:text-ink'
          }`}
        >
          Escrever manualmente
        </Link>
        <Link
          href="/admin/nova?aba=ia"
          className={`px-4 py-2 font-semibold transition-colors ${
            tab === 'ia'
              ? 'bg-brand text-white'
              : 'border border-rule-2 text-ink-2 hover:border-brand hover:text-brand'
          }`}
        >
          Gerar com IA
        </Link>
      </nav>

      {tab === 'ia' ? (
        <AiWizard />
      ) : (
        <Suspense
          fallback={<div className="h-96 border border-rule bg-paper" />}
        >
          <ArticleEditor article={null} />
        </Suspense>
      )}
    </div>
  );
}
