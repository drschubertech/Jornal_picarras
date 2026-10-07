import { fetchArticles } from '@/lib/articles';
import { CATEGORIES } from '@/lib/site';
import { ArticleCard } from '@/components/site/ArticleCard';
import { EmptyState, LatestList, SetupNotice } from '@/components/site/Bits';
import { SectionTitle } from '@/components/site/SectionTitle';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { items, ok } = await fetchArticles({ limit: 60 });

  if (!ok) return <SetupNotice />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-14">
        <EmptyState
          title="Nenhuma matéria publicada ainda"
          description="Acesse o painel da redação para criar a primeira matéria manualmente ou pedir para a IA pesquisar e produzir conteúdo sobre a região."
          action={{ href: '/admin', label: 'Abrir painel' }}
        />
      </div>
    );
  }

  const [lead, ...rest] = items;
  const heroSide = rest.slice(0, 3);
  const ticker = rest.slice(3, 9);
  const used = new Set([lead.id, ...heroSide.map((a) => a.id), ...ticker.map((a) => a.id)]);
  const remaining = rest.filter((a) => !used.has(a.id));

  const sections = CATEGORIES.map((cat) => ({
    cat,
    articles: remaining.filter((a) => a.category === cat.slug).slice(0, 4),
  })).filter((s) => s.articles.length > 0);

  const sidebarLatest = items.slice(0, 8);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      {/* Manchete + destaques */}
      <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <ArticleCard article={lead} variant="lead" priority />
        <div className="grid gap-6 sm:grid-cols-1">
          {heroSide.map((article) => (
            <ArticleCard key={article.id} article={article} variant="story" />
          ))}
        </div>
      </section>

      {/* Últimas em faixa */}
      {ticker.length > 0 && (
        <section className="mt-10 border-y-2 border-ink py-4">
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {ticker.map((article) => (
              <ArticleCard key={article.id} article={article} variant="row" />
            ))}
          </div>
        </section>
      )}

      {/* Corpo */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-12">
          {sections.map(({ cat, articles }) => (
            <section key={cat.slug}>
              <SectionTitle
                title={cat.label}
                href={`/${cat.slug}`}
                kicker="Editoria"
              />
              <div className="grid gap-6 sm:grid-cols-2">
                {articles.map((article, i) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant={i === 0 ? 'story' : 'story'}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="grid content-start gap-8">
          <section className="border border-rule bg-paper-2 p-5">
            <SectionTitle title="Últimas" />
            <LatestList articles={sidebarLatest} />
          </section>

          <section className="border border-rule p-5">
            <p className="eyebrow text-brand">Cobertura</p>
            <p className="mt-2 font-[family-name:var(--font-serif)] text-[0.98rem] leading-relaxed text-ink-2">
              {CATEGORIES.length} editorias cobrindo Balneário Piçarras e as
              cidades da região, com matérias da redação e conteúdo apurado na
              internet pela inteligência artificial, sempre revisado antes da
              publicação.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
