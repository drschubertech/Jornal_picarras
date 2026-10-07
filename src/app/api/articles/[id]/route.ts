import { revalidatePath } from 'next/cache';
import { createClient, getUser } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import { CATEGORIES } from '@/lib/site';
import type { Article, ArticleInput } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const supabase = await createClient();
    const { id } = await ctx.params;

    const query = supabase.from('articles').select().eq('id', id).maybeSingle();
    const { data, error } = await query;
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return Response.json({ error: 'Matéria não encontrada' }, { status: 404 });
    }
    return Response.json({ item: data as Article });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = (await request.json()) as Partial<ArticleInput>;

    if (body.category && !CATEGORIES.some((c) => c.slug === body.category)) {
      return Response.json({ error: 'Categoria inválida.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: current } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!current) {
      return Response.json({ error: 'Matéria não encontrada' }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return Response.json({ error: 'Título vazio.' }, { status: 400 });
      }
      patch.title = body.title.trim();
    }
    if (body.slug !== undefined) {
      const newSlug = slugify(body.slug);
      if (newSlug && newSlug !== current.slug) {
        const { data: dup } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', id)
          .maybeSingle();
        patch.slug = dup ? `${newSlug}-${Date.now().toString(36)}` : newSlug;
      }
    }
    if (body.dek !== undefined) patch.dek = body.dek?.trim() || null;
    if (body.body_html !== undefined) patch.body_html = body.body_html;
    if (body.category !== undefined) patch.category = body.category;
    if (body.tags !== undefined) patch.tags = body.tags;
    if (body.cover_url !== undefined) patch.cover_url = body.cover_url;
    if (body.cover_alt !== undefined) patch.cover_alt = body.cover_alt;
    if (body.author !== undefined) patch.author = body.author;
    if (body.status !== undefined) patch.status = body.status;
    if (body.is_featured !== undefined) patch.is_featured = body.is_featured;
    if (body.source_type !== undefined) patch.source_type = body.source_type;
    if (body.sources !== undefined) patch.sources = body.sources;

    if (body.status === 'published' && !current.published_at) {
      patch.published_at = new Date().toISOString();
    }
    if (body.status === 'draft') {
      patch.published_at = current.published_at;
    }

    const { data, error } = await supabase
      .from('articles')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    revalidatePath('/', 'layout');
    return Response.json({ item: data as Article });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const supabase = await createClient();

    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    revalidatePath('/', 'layout');
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    return Response.json({ error: message }, { status: 500 });
  }
}
