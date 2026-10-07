"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/busca?q=${encodeURIComponent(term)}` : "/busca");
  }

  return (
    <form onSubmit={onSubmit} role="search" className="flex items-center gap-2">
      <label htmlFor="busca-site" className="sr-only">
        Buscar notícias
      </label>
      <input
        id="busca-site"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar notícias…"
        className={
          compact
            ? "w-52 rounded-none border border-rule-2 bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none"
            : "w-full rounded-none border border-rule-2 bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none"
        }
      />
      <button
        type="submit"
        className="bg-ink px-4 py-2 text-sm font-semibold tracking-wide text-paper uppercase transition-colors hover:bg-brand"
      >
        Buscar
      </button>
    </form>
  );
}
