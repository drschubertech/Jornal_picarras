'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { CATEGORIES } from '@/lib/site';
import type {
  Article,
  GeneratedArticle,
  ResearchNotes,
} from '@/lib/types';

type Step = 'form' | 'researched' | 'generated';

export function AiWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].slug);
  const [brief, setBrief] = useState('');
  const [research, setResearch] = useState<ResearchNotes | null>(null);
  const [draft, setDraft] = useState<GeneratedArticle | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? 'Erro inesperado.');
    return data as T;
  }

  async function onResearch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy('research');
    try {
      const data = await post<{ research: ResearchNotes }>('/api/ai/research', {
        topic,
        category,
        brief,
      });
      setResearch(data.research);
      setStep('researched');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na pesquisa.');
    } finally {
      setBusy(null);
    }
  }

  async function onGenerate() {
    setError(null);
    setBusy('generate');
    try {
      const data = await post<{ article: GeneratedArticle }>(
        '/api/ai/generate',
        { topic, category, brief, research },
      );
      setDraft(data.article);
      setStep('generated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na geração.');
    } finally {
      setBusy(null);
    }
  }

  async function onKeepAsDraft() {
    if (!draft) return;
    setError(null);
    setBusy('save');
    try {
      const data = await post<{ item: Article }>('/api/articles', {
        title: draft.title,
        dek: draft.dek,
        category: draft.category || category,
        tags: draft.tags,
        body_html: draft.body_html,
        status: 'draft',
        source_type: 'ai',
        sources: research?.sources ?? [],
      });
      router.push(`/admin/editar/${data.item.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setBusy(null);
    }
  }

  function reset() {
    setStep('form');
    setResearch(null);
    setDraft(null);
    setError(null);
  }

  return (
    <div className="grid gap-6">
      {error && (
        <p className="border-l-4 border-brand bg-paper px-4 py-3 text-sm text-brand">
          {error}
        </p>
      )}

      {/* Passo 1: pauta */}
      <section className="border border-rule bg-paper p-5">
        <p className="eyebrow text-brand">Passo 1 · Pauta</p>
        <form onSubmit={onResearch} className="mt-3 grid gap-4">
          <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
            O que a IA deve pesquisar na internet?
            <textarea
              required
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex.: obras de recomposição da orla na Avenida Aciana de Oliveira Nunes em Balneário Piçarras"
              className="border border-rule-2 bg-paper-2 px-3 py-2.5 text-base text-ink focus:border-ink focus:outline-none"
            />
            <span className="text-xs font-normal text-ink-3">
              A IA busca em portais de notícia, sites oficiais e perfis públicos
              da região (Instagram, Facebook) via busca web.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
              Editoria
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              Orientações (opcional)
              <input
                type="text"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Ex.: focar no impacto no trânsito"
                className="border border-rule-2 bg-paper-2 px-3 py-2.5 text-base text-ink focus:border-ink focus:outline-none"
              />
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={busy !== null}
              className="bg-ink px-5 py-2.5 text-sm font-semibold tracking-wide text-paper uppercase transition-colors hover:bg-brand disabled:opacity-60"
            >
              {busy === 'research'
                ? 'Pesquisando na internet…'
                : step === 'form'
                  ? 'Pesquisar na internet'
                  : 'Pesquisar novamente'}
            </button>
          </div>
        </form>
      </section>

      {/* Passo 2: apuração */}
      {research && step !== 'form' && (
        <section className="border border-rule bg-paper p-5">
          <p className="eyebrow text-brand">Passo 2 · Apuração encontrada</p>

          <p className="mt-3 font-[family-name:var(--font-serif)] text-base leading-relaxed text-ink">
            {research.summary || 'Sem resumo disponível.'}
          </p>

          {research.notes.length > 0 && (
            <ul className="mt-4 grid gap-2 border-t border-rule pt-4">
              {research.notes.map((note, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm leading-relaxed text-ink-2"
                >
                  <span className="font-bold text-brand">{i + 1}</span>
                  {note}
                </li>
              ))}
            </ul>
          )}

          {research.sources.length > 0 && (
            <div className="mt-4 border-t border-rule pt-4">
              <p className="eyebrow text-ink-3">
                Fontes ({research.sources.length})
              </p>
              <ul className="mt-2 grid gap-1.5">
                {research.sources.map((source) => (
                  <li key={source.url} className="text-xs">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-2 underline decoration-rule-2 underline-offset-2 hover:text-brand"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {research.suggested_headline && (
            <p className="mt-4 border-l-4 border-rule-2 bg-paper-2 px-3 py-2 text-sm text-ink-2">
              <strong>Chamada sugerida:</strong> {research.suggested_headline}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={onGenerate}
              disabled={busy !== null}
              className="bg-brand px-5 py-2.5 text-sm font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {busy === 'generate'
                ? 'Escrevendo a matéria…'
                : step === 'generated'
                  ? 'Gerar nova versão'
                  : 'Gerar matéria com base na apuração'}
            </button>
            <button
              onClick={reset}
              disabled={busy !== null}
              className="border border-rule-2 px-5 py-2.5 text-sm font-semibold uppercase text-ink-2 hover:border-ink hover:text-ink disabled:opacity-60"
            >
              Começar de novo
            </button>
          </div>
        </section>
      )}

      {/* Passo 3: prévia */}
      {draft && (
        <section className="border-2 border-ink bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="eyebrow text-brand">Passo 3 · Prévia da matéria</p>
            <span className="border border-rule-2 px-2 py-0.5 text-[0.7rem] font-bold tracking-wide uppercase">
              Aguardando revisão
            </span>
          </div>

          <h3 className="mt-3 font-[family-name:var(--font-playfair)] text-2xl leading-tight font-black text-ink">
            {draft.title}
          </h3>
          {draft.dek && (
            <p className="mt-2 font-[family-name:var(--font-serif)] text-lg text-ink-2">
              {draft.dek}
            </p>
          )}
          {draft.tags.length > 0 && (
            <p className="mt-2 text-xs tracking-wide text-ink-3 uppercase">
              Tags: {draft.tags.join(' · ')}
            </p>
          )}

          <div
            className="prose-jornal mt-5 border-t border-rule pt-5"
            dangerouslySetInnerHTML={{ __html: draft.body_html }}
          />

          <div className="mt-6 flex flex-wrap gap-3 border-t-2 border-ink pt-4">
            <button
              onClick={onKeepAsDraft}
              disabled={busy !== null}
              className="bg-ink px-5 py-2.5 text-sm font-semibold tracking-wide text-paper uppercase transition-colors hover:bg-brand disabled:opacity-60"
            >
              {busy === 'save'
                ? 'Salvando…'
                : 'Abrir no editor e revisar'}
            </button>
            <button
              onClick={onGenerate}
              disabled={busy !== null}
              className="border border-ink px-5 py-2.5 text-sm font-semibold uppercase transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
            >
              {busy === 'generate' ? 'Gerando…' : 'Regerar'}
            </button>
            <button
              onClick={reset}
              disabled={busy !== null}
              className="text-sm font-semibold text-ink-3 hover:text-ink"
            >
              Nova pauta
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
