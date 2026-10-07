import Image from "next/image";
import Link from "next/link";
import { categoryLabel } from "@/lib/site";
import type { Article } from "@/lib/types";
import { formatDatePT, formatTimePT } from "@/lib/utils";

type Variant = "lead" | "story" | "row" | "compact";

function TypographicCover({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden bg-ink p-5 text-paper ${
        large ? "aspect-[16/9]" : "aspect-[3/2]"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 -bottom-10 font-[family-name:var(--font-playfair)] font-black text-white/5 select-none"
        style={{ fontSize: large ? "14rem" : "9rem", lineHeight: 1 }}
      >
        {categoryLabel(article.category).charAt(0)}
      </span>
      <span className="eyebrow relative z-10 text-brand">
        {categoryLabel(article.category)}
      </span>
      <span className="relative z-10 font-[family-name:var(--font-playfair)] text-xl leading-tight font-bold sm:text-2xl">
        {article.title}
      </span>
      <span className="relative z-10 text-xs tracking-wide text-paper/60 uppercase">
        {formatDatePT(article.published_at ?? article.created_at)}
      </span>
    </div>
  );
}

function Cover({ article, large = false, priority = false }: { article: Article; large?: boolean; priority?: boolean }) {
  if (article.cover_url) {
    return (
      <div className={`relative overflow-hidden bg-paper-3 ${large ? "aspect-[16/9]" : "aspect-[3/2]"}`}>
        <Image
          src={article.cover_url}
          alt={article.cover_alt || article.title}
          fill
          priority={priority}
          sizes={large ? "(max-width: 1180px) 100vw, 760px" : "(max-width: 768px) 100vw, 380px"}
          className="object-cover"
        />
      </div>
    );
  }
  return <TypographicCover article={article} large={large} />;
}

function Meta({ article, align = "left" }: { article: Article; align?: "left" | "center" }) {
  return (
    <p
      className={`text-[0.72rem] tracking-wide text-ink-3 uppercase ${
        align === "center" ? "text-center" : ""
      }`}
    >
      {categoryLabel(article.category)}
      {article.published_at || article.created_at
        ? ` · ${formatTimePT(article.published_at ?? article.created_at)}`
        : ""}
      {article.source_type === "ai" ? " · com apoio de IA" : ""}
    </p>
  );
}

export function ArticleCard({
  article,
  variant = "story",
  priority = false,
}: {
  article: Article;
  variant?: Variant;
  priority?: boolean;
}) {
  const href = `/materia/${article.slug}`;

  if (variant === "lead") {
    return (
      <article className="group">
        <Link href={href} className="block">
          <Cover article={article} large priority={priority} />
          <div className="mt-4">
            <Meta article={article} />
            <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl leading-[1.08] font-black text-ink transition-colors group-hover:text-brand sm:text-[2.75rem]">
              {article.title}
            </h1>
            {article.dek && (
              <p className="mt-3 max-w-2xl font-[family-name:var(--font-serif)] text-lg leading-relaxed text-ink-2">
                {article.dek}
              </p>
            )}
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "story") {
    return (
      <article className="group flex flex-col">
        <Link href={href} className="block">
          <Cover article={article} priority={priority} />
          <div className="mt-3">
            <Meta article={article} />
            <h2 className="mt-1.5 font-[family-name:var(--font-playfair)] text-xl leading-snug font-bold text-ink transition-colors group-hover:text-brand">
              {article.title}
            </h2>
            {article.dek && (
              <p className="mt-2 font-[family-name:var(--font-serif)] text-[0.95rem] leading-relaxed text-ink-2">
                {article.dek}
              </p>
            )}
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="group border-t border-rule pt-3">
        <Link href={href} className="block">
          <Meta article={article} />
          <h2 className="mt-1 font-[family-name:var(--font-playfair)] text-lg leading-snug font-bold text-ink transition-colors group-hover:text-brand">
            {article.title}
          </h2>
          {article.dek && (
            <p className="mt-1.5 font-[family-name:var(--font-serif)] text-sm leading-relaxed text-ink-2">
              {article.dek}
            </p>
          )}
          <p className="mt-1.5 text-[0.72rem] text-ink-3">
            {formatDatePT(article.published_at ?? article.created_at)}
          </p>
        </Link>
      </article>
    );
  }

  return (
    <article className="group border-t border-rule py-2.5">
      <Link href={href} className="flex items-baseline justify-between gap-3">
        <h3 className="font-[family-name:var(--font-serif)] text-[0.98rem] leading-snug font-semibold text-ink transition-colors group-hover:text-brand">
          {article.title}
        </h3>
        <span className="shrink-0 text-[0.7rem] text-ink-3 tabular-nums">
          {formatTimePT(article.published_at ?? article.created_at)}
        </span>
      </Link>
    </article>
  );
}
