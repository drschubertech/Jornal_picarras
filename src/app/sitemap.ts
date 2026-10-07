import type { MetadataRoute } from 'next';
import { fetchArticles } from '@/lib/articles';
import { CATEGORIES, SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/sobre`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/busca`, changeFrequency: 'monthly', priority: 0.3 },
    ...CATEGORIES.map((cat) => ({
      url: `${base}/${cat.slug}`,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    })),
  ];

  try {
    const { items } = await fetchArticles({ limit: 100 });
    const articles: MetadataRoute.Sitemap = items.map((article) => ({
      url: `${base}/materia/${article.slug}`,
      lastModified: article.updated_at,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    return [...staticPages, ...articles];
  } catch {
    return staticPages;
  }
}
