import { revalidatePath } from 'next/cache';
import { createClient, getUser } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import { CATEGORIES } from '@/lib/site';
import type { Article, ArticleInput } from '@/lib/types';

function sanitizeSearch(q: string): string {
  return q.replace(/[,%()]/g, ' ').trim();
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? 'published';
    const category = searchParams.get('category');
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
    const q = searchParams.get('q');
    const featured = searchParams.get('featured');
    const offset = Number(searchParams.get('offset') ?? 0);

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status === 'published') query = query.eq('status', 'published');
    if (status === 'draft') query = query.eq('status', 'draft');
    if (category) query = query.eq('category', category);
    if (featured === 'true') query = query.eq('is_featured', true);
    if (q) {
      const term = sanitizeSearch(q);
      if (term) query = query.or(`title.ilike.%${term}%,dek.ilike.%${term}%`);
    }

    const { data, error, count } = await query;
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ items: (data ?? []) as Article[], count: count ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = (await request.json()) as ArticleInput;
    if (!body.title?.trim()) {
      return Response.json({ error: 'Título é obrigatório.' }, { status: 400 });
    }
    if (!CATEGORIES.some((c) => c.slug === body.category)) {
      return Response.json({ error: 'Categoria inválida.' }, { status: 400 });
    }

    const supabase = await createClient();

    let slug = body.slug ? slugify(body.slug) : slugify(body.title);
    if (!slug) slug = `materia-${Date.now()}`;

    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) slug = `${slug}-${Date.now().toString(36)}`;

    const now = new Date().toISOString();
    const record = {
      slug,
      title: body.title.trim(),
      dek: body.dek?.trim() || null,
      body_html: body.body_html ?? '',
      category: body.category,
      tags: body.tags ?? [],
      cover_url: body.cover_url ?? null,
      cover_alt: body.cover_alt ?? null,
      author: body.author?.trim() || 'Redação',
      status: body.status ?? 'draft',
      is_featured: body.is_featured ?? false,
      source_type: body.source_type ?? 'manual',
      sources: body.sources ?? [],
      published_at:
        body.status === 'published' ? (body.published_at ?? now) : null,
    };

    const { data, error } = await supabase
      .from('articles')
      .insert(record)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    revalidatePath('/', 'layout');
    return Response.json({ item: data as Article }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    return Response.json({ error: message }, { status: 500 });
  }
}
