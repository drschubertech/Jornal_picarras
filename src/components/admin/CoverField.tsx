'use client';

import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/types';

export function CoverField({
  coverUrl,
  coverAlt,
  onCoverUrl,
  onCoverAlt,
}: {
  coverUrl: string;
  coverAlt: string;
  onCoverUrl: (url: string) => void;
  onCoverAlt: (alt: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!isSupabaseConfigured()) {
      setError('Supabase não configurado: use o campo de URL abaixo.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande (máx. 5 MB).');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upError } = await supabase.storage
        .from('covers')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upError) throw new Error(upError.message);
      const { data } = supabase.storage.from('covers').getPublicUrl(path);
      onCoverUrl(data.publicUrl);
      if (!coverAlt) onCoverAlt(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no upload.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-32 w-48 shrink-0 overflow-hidden border border-rule bg-paper-3">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={coverAlt || 'Capa'}
              fill
              sizes="192px"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-ink-3">
              Sem capa
            </span>
          )}
        </div>

        <div className="grid gap-2 text-sm">
          <label className="cursor-pointer bg-ink px-4 py-2 text-center font-semibold tracking-wide text-paper uppercase transition-colors hover:bg-brand disabled:opacity-60">
            {uploading ? 'Enviando…' : 'Enviar imagem'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
              disabled={uploading}
            />
          </label>
          {coverUrl && (
            <button
              type="button"
              onClick={() => onCoverUrl('')}
              className="border border-rule-2 px-4 py-2 text-xs font-semibold text-ink-2 hover:border-brand hover:text-brand"
            >
              Remover capa
            </button>
          )}
          <p className="text-xs text-ink-3">
            JPG/PNG até 5 MB. Sem capa, o site usa um layout tipográfico.
          </p>
        </div>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
        URL da capa (alternativa)
        <input
          type="url"
          value={coverUrl}
          onChange={(e) => onCoverUrl(e.target.value)}
          placeholder="https://…"
          className="border border-rule-2 bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        />
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-ink-2">
        Descrição da imagem (acessibilidade)
        <input
          type="text"
          value={coverAlt}
          onChange={(e) => onCoverAlt(e.target.value)}
          placeholder="Ex.: Praia central de Balneário Piçarras no fim da tarde"
          className="border border-rule-2 bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        />
      </label>

      {error && (
        <p className="border-l-4 border-brand bg-paper px-3 py-2 text-sm text-brand">
          {error}
        </p>
      )}
    </div>
  );
}
