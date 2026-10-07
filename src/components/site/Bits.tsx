import Link from "next/link";
import type { Article } from "@/lib/types";
import { formatDatePT } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="border border-dashed border-rule-2 bg-paper-2 px-6 py-14 text-center">
      <p className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-ink">
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-2">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-block bg-ink px-5 py-2.5 text-sm font-semibold tracking-wide text-paper uppercase transition-colors hover:bg-brand"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function SetupNotice() {
  return (
    <div className="mx-auto my-10 max-w-[900px] border-l-4 border-brand bg-paper-2 p-6">
      <p className="eyebrow text-brand">Configuração pendente</p>
      <p className="mt-2 font-[family-name:var(--font-serif)] text-lg leading-relaxed text-ink">
        O banco de dados ainda não foi conectado. Para publicar as primeiras
        matérias, siga o passo&nbsp;3 do <strong>README</strong>: execute o
        arquivo <code className="bg-paper-3 px-1">supabase/schema.sql</code> no
        Supabase e preencha o <code className="bg-paper-3 px-1">.env.local</code>.
      </p>
    </div>
  );
}

export function LatestList({ articles }: { articles: Article[] }) {
  return (
    <ul>
      {articles.map((article) => (
        <li key={article.id} className="border-t border-rule py-3 first:border-t-0 first:pt-0">
          <Link href={`/materia/${article.slug}`} className="group block">
            <p className="text-[0.7rem] tracking-wide text-ink-3 uppercase">
              {formatDatePT(article.published_at ?? article.created_at)}
            </p>
            <p className="mt-1 font-[family-name:var(--font-serif)] text-[0.98rem] leading-snug font-semibold text-ink transition-colors group-hover:text-brand">
              {article.title}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
