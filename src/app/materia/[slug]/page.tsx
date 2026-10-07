import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchArticleBySlug, fetchArticles } from '@/lib/articles';
import { categoryLabel } from '@/lib/site';
import type { Article } from '@/lib/types';
import {
  excerptFromHtml,
  formatDatePT,
  formatTimePT,
  readingTimeMinutes,
} from '@/lib/utils';
import { ArticleCard } from '@/components/site/ArticleCard';
import { SectionTitle } from '@/components/site/SectionTitle';
import { SetupNotice } from '@/components/site/Bits';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await fetchArticleBySlug(slug);
  if (!item) return { title: 'Matéria não encontrada' };

  const description = item.dek || excerptFromHtml(item.body_html);
  return {
    title: item.title,
    description,
    openGraph: {
      type: 'article',
      title: item.title,
      description,
      publishedTime: item.published_at ?? undefined,
      authors: [item.author],
    },
  };
}

function Cover({ article }: { article: Article }) {
  if (!article.cover_url) return null;
  return (
    <figure className="mt-6">
      <div className="relative aspect-[16/9] overflow-hidden bg-paper-3">
        <Image
          src={article.cover_url}
          alt={article.cover_alt || article.title}
          fill
          priority
          sizes="(max-width: 1180px) 100vw, 820px"
          className="object-cover"
        />
      </div>
      {article.cover_alt && (
        <figcaption className="mt-2 text-xs text-ink-3">
          {article.cover_alt}
        </figcaption>
      )}
    </figure>
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const { item, ok } = await fetchArticleBySlug(slug);

  if (!ok) {
    return <SetupNotice />;
  }
  if (!item) notFound();

  const related = await fetchArticles({
    category: item.category,
    limit: 4,
  });
  const others = related.items.filter((a) => a.id !== item.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <nav className="eyebrow text-ink-3">
            <Link href="/" className="hover:text-brand">
              Home
            </Link>
            <span className="mx-2">›</span>
            <Link href={`/${item.category}`} className="text-brand">
              {categoryLabel(item.category)}
            </Link>
          </nav>

          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl leading-[1.1] font-black text-ink sm:text-[2.9rem]">
            {item.title}
          </h1>

          {item.dek && (
            <p className="mt-4 max-w-3xl font-[family-name:var(--font-serif)] text-xl leading-relaxed text-ink-2">
              {item.dek}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-rule py-3 text-[0.78rem] text-ink-3">
            <span className="font-semibold text-ink-2">
              {item.author || 'Redação'}
            </span>
            <time dateTime={item.published_at ?? item.created_at}>
              {formatDatePT(item.published_at ?? item.created_at)}
              {item.published_at ? ` · ${formatTimePT(item.published_at)}` : ''}
            </time>
            <span>{readingTimeMinutes(item.body_html)} min de leitura</span>
            {item.source_type === 'ai' && (
              <span className="border border-rule-2 px-2 py-0.5 tracking-wide uppercase">
                Apuração com IA · revisada
              </span>
            )}
          </div>

          <Cover article={item} />

          <div
            className="prose-jornal mt-8"
            dangerouslySetInnerHTML={{ __html: item.body_html }}
          />

          {item.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-rule-2 bg-paper-2 px-3 py-1 text-xs tracking-wide text-ink-2 uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {item.sources.length > 0 && (
            <section className="mt-10 border-t-2 border-ink pt-5">
              <p className="eyebrow text-brand">Fontes consultadas</p>
              <ul className="mt-3 grid gap-2">
                {item.sources.map((source) => (
                  <li key={source.url} className="text-sm">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-brand"
                    >
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="grid content-start gap-8">
          {others.length > 0 && (
            <section>
              <SectionTitle
                title="Mais nesta editoria"
                href={`/${item.category}`}
              />
              <div className="grid gap-5">
                {others.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="row" />
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
