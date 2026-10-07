'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { CATEGORIES } from '@/lib/site';
import type { Article } from '@/lib/types';
import { TipTapEditor } from './TipTapEditor';
import { CoverField } from './CoverField';

type State = {
  title: string;
  slug: string;
  dek: string;
  category: string;
  tags: string;
  author: string;
  cover_url: string;
  cover_alt: string;
  body_html: string;
  is_featured: boolean;
};

function initialState(article: Article | null): State {
  return {
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    dek: article?.dek ?? '',
    category: article?.category ?? CATEGORIES[0].slug,
    tags: (article?.tags ?? []).join(', '),
    author: article?.author ?? 'Redação',
    cover_url: article?.cover_url ?? '',
    cover_alt: article?.cover_alt ?? '',
    body_html: article?.body_html ?? '',
    is_featured: article?.is_featured ?? false,
  };
}

export function ArticleEditor({
  article,
  onPublished,
}: {
  article: Article | null;
  onPublished?: (article: Article) => void;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>(() => initialState(article));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const sources = article?.sources ?? [];
  const words = state.body_html
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  function set<K extends keyof State>(key: K, value: State[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  async function save(status: 'draft' | 'published') {
    setError(null);
    setNotice(null);

    if (!state.title.trim()) {
      setError('Escreva o título da matéria.');
      return;
    }
    if (state.body_html.replace(/<[^>]*>/g, '').trim().length < 40) {
      setError('O corpo da matéria está muito curto.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: state.title,
        slug: state.slug || undefined,
        dek: state.dek,
        category: state.category,
        tags: state.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        author: state.author,
        cover_url: state.cover_url || null,
        cover_alt: state.cover_alt || null,
        body_html: state.body_html,
        is_featured: state.is_featured,
        status,
      };

      const url = article ? `/api/articles/${article.id}` : '/api/articles';
      const res = await fetch(url, {
        method: article ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? 'Erro ao salvar a matéria.');
        return;
      }

      const saved = data.item as Article;
      onPublished?.(saved);

      if (status === 'published') {
        setNotice('Matéria publicada no site.');
        if (!article) router.replace(`/admin/editar/${saved.id}`);
        else router.refresh();
      } else {
        setNotice('Rascunho salvo.');
        if (!article) router.replace(`/admin/editar/${saved.id}`);
        else router.refresh();
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void save('draft');
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-4 border border-rule bg-paper p-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
            Título
            <textarea
              required
              rows={2}
              value={state.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Chamada da matéria (máx. 95 caracteres)"
              className="border border-rule-2 bg-paper-2 px-3 py-2.5 font-[family-name:var(--font-playfair)] text-lg font-bold text-ink focus:border-ink focus:outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
            Linha fina (resumo)
            <textarea
              rows={2}
              value={state.dek}
              onChange={(e) => set('dek', e.target.value)}
              placeholder="Subtítulo que resume a matéria (100 a 180 caracteres)"
              className="border border-rule-2 bg-paper-2 px-3 py-2.5 font-[family-name:var(--font-serif)] text-base text-ink focus:border-ink focus:outline-none"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
              Editoria
              <select
                value={state.category}
                onChange={(e) => set('category', e.target.value)}
                className="border border-rule-2 bg-paper-2 px-3 py-2.5 text-base text-ink focus:border-ink focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
              Autor
              <input
                type="text"
                value={state.author}
                onChange={(e) => set('author', e.target.value)}
                className="border border-rule-2 bg-paper-2 px-3 py-2.5 text-base text-ink focus:border-ink focus:outline-none"
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
            Tags (separadas por vírgula)
            <input
              type="text"
              value={state.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="orla, turismo, temporada"
              className="border border-rule-2 bg-paper-2 px-3 py-2.5 text-base text-ink focus:border-ink focus:outline-none"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
            Endereço (URL da matéria)
            <div className="flex items-center border border-rule-2 bg-paper-2 text-sm">
              <span className="border-r border-rule-2 px-3 py-2.5 text-ink-3">
                /materia/
              </span>
              <input
                type="text"
                value={state.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="gerado-automaticamente"
                className="w-full bg-transparent px-3 py-2.5 text-ink focus:outline-none"
              />
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold text-ink-2">
            <input
              type="checkbox"
              checked={state.is_featured}
              onChange={(e) => set('is_featured', e.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            Destacar na home
          </label>
        </div>

        <div className="grid content-start gap-4">
          <CoverField
            coverUrl={state.cover_url}
            coverAlt={state.cover_alt}
            onCoverUrl={(v) => set('cover_url', v)}
            onCoverAlt={(v) => set('cover_alt', v)}
          />

          {sources.length > 0 && (
            <div className="border border-rule bg-paper-2 p-4">
              <p className="eyebrow text-brand">
                Fontes da apuração da IA ({sources.length})
              </p>
              <ul className="mt-2 grid gap-1.5">
                {sources.map((s) => (
                  <li key={s.url} className="text-xs">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-2 underline decoration-rule-2 underline-offset-2 hover:text-brand"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="eyebrow text-ink-3">Corpo da matéria</p>
          <p className="text-xs text-ink-3">{words} palavras</p>
        </div>
        <TipTapEditor
          value={state.body_html}
          onChange={(html) => set('body_html', html)}
        />
      </div>

      {error && (
        <p className="border-l-4 border-brand bg-paper px-4 py-3 text-sm text-brand">
          {error}
        </p>
      )}
      {notice && (
        <p className="border-l-4 border-ink bg-paper px-4 py-3 text-sm text-ink-2">
          {notice}
          {article?.status === 'published' && (
            <>
              {' '}
              <Link
                href={`/materia/${article.slug}`}
                target="_blank"
                className="font-semibold text-brand underline"
              >
                Ver no site
              </Link>
            </>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t-2 border-ink pt-4">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save('draft')}
          className="border border-ink px-5 py-2.5 text-sm font-semibold tracking-wide uppercase transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
        >
          Salvar rascunho
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save('published')}
          className="bg-brand px-5 py-2.5 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? 'Salvando…' : 'Salvar e publicar'}
        </button>
        <Link
          href="/admin"
          className="text-sm font-semibold text-ink-3 hover:text-ink"
        >
          Voltar para a lista
        </Link>
      </div>
    </form>
  );
}
