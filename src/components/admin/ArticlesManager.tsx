'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { categoryLabel } from '@/lib/site';
import type { Article } from '@/lib/types';
import { formatDateTimePT } from '@/lib/utils';

type Filter = 'all' | 'published' | 'draft';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'published', label: 'Publicadas' },
  { key: 'draft', label: 'Rascunhos' },
];

export function ArticlesManager({ initial }: { initial: Article[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.status === filter)),
    [items, filter],
  );

  async function patch(id: string, body: Partial<Article>) {
    setBusy(id);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.item) {
        setItems((prev) => prev.map((i) => (i.id === id ? data.item : i)));
        router.refresh();
      } else {
        alert(data.error ?? 'Erro ao salvar.');
      }
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    if (!confirm('Excluir esta matéria? A ação não pode ser desfeita.')) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? 'Erro ao excluir.');
      }
    } finally {
      setBusy(null);
    }
  }

  const counts = {
    all: items.length,
    published: items.filter((i) => i.status === 'published').length,
    draft: items.filter((i) => i.status === 'draft').length,
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.key
                ? 'bg-ink text-paper'
                : 'border border-rule-2 text-ink-2 hover:border-ink'
            }`}
          >
            {f.label} ({counts[f.key]})
          </button>
        ))}
        <Link
          href="/admin/nova"
          className="ml-auto bg-brand px-4 py-2 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark"
        >
          + Nova matéria
        </Link>
      </div>

      {visible.length === 0 ? (
        <div className="border border-dashed border-rule-2 bg-paper px-6 py-12 text-center">
          <p className="font-[family-name:var(--font-playfair)] text-xl font-bold">
            Nenhuma matéria por aqui
          </p>
          <p className="mt-2 text-sm text-ink-2">
            Crie uma manualmente ou peça à IA que pesquise e produza o
            conteúdo.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/admin/nova"
              className="bg-ink px-4 py-2 text-sm font-semibold text-paper uppercase hover:bg-brand"
            >
              Escrever manualmente
            </Link>
            <Link
              href="/admin/nova?aba=ia"
              className="border border-ink px-4 py-2 text-sm font-semibold uppercase hover:bg-ink hover:text-paper"
            >
              Gerar com IA
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-rule bg-paper">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-rule text-[0.72rem] tracking-wide text-ink-3 uppercase">
                <th className="px-4 py-3 font-semibold">Matéria</th>
                <th className="px-4 py-3 font-semibold">Editoria</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((article) => (
                <tr key={article.id} className="border-b border-rule last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/editar/${article.id}`}
                      className="font-semibold text-ink hover:text-brand"
                    >
                      {article.title}
                    </Link>
                    <div className="mt-0.5 flex gap-2 text-[0.7rem] text-ink-3 uppercase">
                      <span>{article.source_type === 'ai' ? 'IA' : 'Manual'}</span>
                      {article.is_featured && <span className="text-brand">Destaque</span>}
                      {article.sources.length > 0 && (
                        <span>{article.sources.length} fonte(s)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-2">
                    {categoryLabel(article.category)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase ${
                        article.status === 'published'
                          ? 'bg-ink text-paper'
                          : 'border border-rule-2 text-ink-3'
                      }`}
                    >
                      {article.status === 'published' ? 'No ar' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-3">
                    {formatDateTimePT(
                      article.published_at ?? article.created_at,
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2 text-xs font-semibold">
                      <button
                        disabled={busy === article.id}
                        onClick={() =>
                          patch(article.id, {
                            status:
                              article.status === 'published' ? 'draft' : 'published',
                          })
                        }
                        className="border border-rule-2 px-2.5 py-1 transition-colors hover:border-ink disabled:opacity-50"
                      >
                        {article.status === 'published' ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button
                        disabled={busy === article.id}
                        onClick={() =>
                          patch(article.id, { is_featured: !article.is_featured })
                        }
                        className="border border-rule-2 px-2.5 py-1 transition-colors hover:border-ink disabled:opacity-50"
                      >
                        {article.is_featured ? 'Remover destaque' : 'Destacar'}
                      </button>
                      <Link
                        href={`/admin/editar/${article.id}`}
                        className="border border-rule-2 px-2.5 py-1 transition-colors hover:border-ink"
                      >
                        Editar
                      </Link>
                      <button
                        disabled={busy === article.id}
                        onClick={() => remove(article.id)}
                        className="border border-brand px-2.5 py-1 text-brand transition-colors hover:bg-brand hover:text-white disabled:opacity-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
