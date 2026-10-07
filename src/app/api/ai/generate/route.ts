import { getUser } from '@/lib/supabase/server';
import { isGeminiConfigured, type ResearchNotes } from '@/lib/types';
import { generateArticle } from '@/lib/gemini';

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 });
    }
    if (!isGeminiConfigured()) {
      return Response.json(
        {
          error:
            'GEMINI_API_KEY não configurada. Crie uma chave em aistudio.google.com/apikey e adicione no .env.local.',
        },
        { status: 503 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const topic = String(body.topic ?? '').trim();
    const category = String(body.category ?? '').trim();
    const brief = body.brief ? String(body.brief).trim() : undefined;
    const researchNotes = body.research as ResearchNotes | undefined;

    if (topic.length < 8) {
      return Response.json(
        { error: 'Descreva a pauta com pelo menos 8 caracteres.' },
        { status: 400 },
      );
    }

    const article = await generateArticle({
      topic,
      category,
      brief,
      research: researchNotes,
    });

    if (!article.title || !article.body_html) {
      return Response.json(
        { error: 'A IA não conseguiu montar a matéria. Tente reformular a pauta.' },
        { status: 502 },
      );
    }

    return Response.json({ article });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado';
    return Response.json({ error: message }, { status: 500 });
  }
}
