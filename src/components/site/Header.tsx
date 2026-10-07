import Link from "next/link";
import { Suspense } from "react";
import { CATEGORIES, SITE } from "@/lib/site";
import { todayLong } from "@/lib/utils";
import { SearchForm } from "./SearchForm";

export function Header() {
  return (
    <header className="border-b border-rule bg-paper">
      <div className="border-b border-rule">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-2 text-ink-3">
          <p className="text-[0.78rem] capitalize">{todayLong()}</p>
          <div className="flex items-center gap-4 text-[0.78rem]">
            <span className="hidden sm:inline">{SITE.region}</span>
            <Link
              href="/admin/login"
              className="font-semibold text-ink-2 transition-colors hover:text-brand"
            >
              Painel da redação
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-4 pt-6 pb-4 text-center">
        <Link href="/" className="inline-block">
          <span className="eyebrow block text-brand">
            {SITE.cities.length} cidades · litoral norte de santa catarina
          </span>
          <span className="mt-1 block font-[family-name:var(--font-playfair)] text-[2.4rem] leading-[1.05] font-black tracking-tight text-ink sm:text-[3.4rem]">
            {SITE.name}
          </span>
          <span className="mt-1 block font-[family-name:var(--font-serif)] text-sm text-ink-2 italic sm:text-base">
            {SITE.tagline}
          </span>
        </Link>
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-4">
          <nav className="flex-1 overflow-x-auto">
            <ul className="flex items-stretch gap-0 text-[0.82rem] font-semibold tracking-wide uppercase">
              <li>
                <Link
                  href="/"
                  className="block px-3 py-3 whitespace-nowrap text-ink transition-colors hover:text-brand"
                >
                  Home
                </Link>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/${cat.slug}`}
                    className="block px-3 py-3 whitespace-nowrap text-ink-2 transition-colors hover:text-brand"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hidden shrink-0 py-2 md:block">
            <Suspense fallback={<div className="h-8 w-64" />}>
              <SearchForm compact />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="h-px bg-ink" />
    </header>
  );
}
