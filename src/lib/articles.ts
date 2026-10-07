import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, type Article } from '@/lib/types';

export interface FetchOptions {
  category?: string;
  limit?: number;
  q?: string;
  featured?: boolean;
  status?: 'published' | 'draft' | 'all';
}

export async function fetchArticles(
  opts: FetchOptions = {},
): Promise<{ items: Article[]; ok: boolean }> {
  if (!isSupabaseConfigured()) return { items: [], ok: false };

  try {
    const supabase = await createClient();
    const limit = Math.min(opts.limit ?? 30, 100);

    let query = supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if ((opts.status ?? 'published') === 'published') {
      query = query.eq('status', 'published');
    } else if (opts.status === 'draft') {
      query = query.eq('status', 'draft');
    }
    if (opts.category) query = query.eq('category', opts.category);
    if (opts.featured) query = query.eq('is_featured', true);

    if (opts.q) {
      const term = opts.q.replace(/[,%()]/g, ' ').trim();
      if (term) query = query.or(`title.ilike.%${term}%,dek.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { items: (data ?? []) as Article[], ok: true };
  } catch {
    return { items: [], ok: false };
  }
}

export async function fetchArticleBySlug(
  slug: string,
): Promise<{ item: Article | null; ok: boolean }> {
  if (!isSupabaseConfigured()) return { item: null, ok: false };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { item: (data as Article) ?? null, ok: true };
  } catch {
    return { item: null, ok: false };
  }
}
