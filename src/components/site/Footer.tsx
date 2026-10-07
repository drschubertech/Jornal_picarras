import Link from "next/link";
import { CATEGORIES, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-ink bg-paper-2">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-playfair)] text-2xl font-black text-ink">
            {SITE.name}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-2">
            Jornalismo digital independente cobrindo {SITE.cities.join(", ")} e
            demais cidades do {SITE.region}. Publicação diária de matérias da
            redação e conteúdo apurado com apoio de inteligência artificial,
            sempre revisado antes de ir ao ar.
          </p>
        </div>

        <div>
          <p className="eyebrow text-ink-3">Editorias</p>
          <ul className="mt-3 grid gap-1.5 text-sm">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/${cat.slug}`}
                  className="text-ink-2 transition-colors hover:text-brand"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow text-ink-3">Seções</p>
          <ul className="mt-3 grid gap-1.5 text-sm">
            <li>
              <Link href="/sobre" className="text-ink-2 hover:text-brand">
                Sobre o jornal
              </Link>
            </li>
            <li>
              <Link href="/busca" className="text-ink-2 hover:text-brand">
                Busca
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-ink-2 hover:text-brand">
                Painel da redação
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-1 px-4 py-4 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Todos os direitos
            reservados.
          </p>
          <p>{SITE.region} · Brasil</p>
        </div>
      </div>
    </footer>
  );
}
