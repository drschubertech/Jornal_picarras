import { GoogleGenAI, Type } from '@google/genai';
import {
  isGeminiConfigured,
  type ArticleSource,
  type GeneratedArticle,
  type ResearchNotes,
} from '@/lib/types';
import { CATEGORIES } from '@/lib/site';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getClient() {
  if (!isGeminiConfigured()) {
    throw new Error(
      'GEMINI_API_KEY não configurada — crie uma chave em https://aistudio.google.com/apikey',
    );
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

function extractSources(res: {
  candidates?: Array<{
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: { uri?: string; title?: string; snippet?: string };
      }>;
    };
  }>;
}): ArticleSource[] {
  const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: ArticleSource[] = [];
  for (const chunk of chunks) {
    const web = chunk.web;
    if (!web?.uri || seen.has(web.uri)) continue;
    seen.add(web.uri);
    sources.push({
      url: web.uri,
      title: web.title ?? web.uri,
      snippet: web.snippet,
    });
  }
  return sources;
}

export interface ResearchInput {
  topic: string;
  category: string;
  brief?: string;
}

export async function research(input: ResearchInput): Promise<ResearchNotes> {
  const ai = getClient();
  const category = CATEGORIES.find((c) => c.slug === input.category);

  const prompt = `Você é repórter de um jornal regional brasileiro cobrindo Balneário Piçarras e cidades vizinhas (${['Balneário Piçarras', 'Penha', 'Ilhota', 'Riqueza', 'Maracajá', 'Sombrio'].join(', ')}) no litoral norte de Santa Catarina.

PAUTA: ${input.topic}
EDITORIA: ${category?.label ?? input.category}
${input.brief ? `ORIENTAÇÕES DO EDITOR: ${input.brief}` : ''}

Pesquise na internet informações recentes e verificáveis sobre a pauta. Procure em portais de notícia locais e regionais (por exemplo Diário de Santa Catarina, NSC, G1, TN7, agências de notícias), sites oficiais (prefeituras, polícias, tribunais), perfis públicos no Instagram e Facebook da região (busque por nomes de órgãos, times, veículos e entidades da cidade) e qualquer outra fonte pública relevante.

Responda em JSON com exatamente esta estrutura:
{
  "summary": "resumo factual do que foi apurado (2 a 4 frases)",
  "notes": ["nota factual 1 com data/local/fonte", "nota factual 2", "..."],
  "suggested_headline": "chamada sugerida para a matéria"
}

Regras: só inclua fatos apoiados nas fontes; indique datas quando disponíveis; nada de especulação; escreva em português do Brasil.`;

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.2,
    },
  });

  const sources = extractSources(res);
  const parsed = safeParse<ResearchNotes>(res.text ?? '', {
    summary: '',
    notes: [],
    sources,
    suggested_headline: '',
  });

  return {
    summary: parsed.summary,
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    suggested_headline: parsed.suggested_headline,
    sources,
  };
}

export interface GenerateInput {
  topic: string;
  category: string;
  brief?: string;
  research?: ResearchNotes;
}

export async function generateArticle(
  input: GenerateInput,
): Promise<GeneratedArticle> {
  const ai = getClient();
  const category = CATEGORIES.find((c) => c.slug === input.category);

  const researchBlock = input.research
    ? `
APURAÇÃO PESQUISADA (use como base factual):
Resumo: ${input.research.summary}

Notas:
${input.research.notes.map((n, i) => `${i + 1}. ${n}`).join('\n')}

Fontes:
${input.research.sources.map((s) => `- ${s.title} (${s.url})`).join('\n')}
`
    : '';

  const prompt = `Você é jornalista profissional de um jornal regional brasileiro. Escreva uma matéria completa em português do Brasil para o site do "Jornal de Balneário Piçarras", cobrindo Balneário Piçarras e região (Penha, Ilhota, Riqueza, Maracajá, Sombrio), litoral norte de Santa Catarina.

EDITORIA: ${category?.label ?? input.category} (slug: ${input.category})
PAUTA: ${input.topic}
${input.brief ? `ORIENTAÇÕES DO EDITOR: ${input.brief}` : ''}
${researchBlock}

Escreva a matéria com:
- lead objetivo respondendo quem, o quê, quando, onde, por que;
- entre 350 e 700 palavras, em 4 a 7 parágrafos, com no máximo um subtítulo (<h2>) no meio;
- linguagem jornalística, impessoal, precisa;
- quando a apuração tiver números, datas e locais, use-os;
- cite as instituições e pessoas pelo nome quando a apuração informar;
- termine sem repetir o lead.

Formato do conteúdo: HTML válido com apenas <p>, <h2>, <strong>, <em>, <ul>, <ol>, <li>, <blockquote>. Nada de <html>, <body>, <style> ou classes.

Também devolva:
- title: chamada com no máximo 95 caracteres, sem ponto final;
- dek: linha fina de 100 a 180 caracteres resumindo a matéria;
- tags: 3 a 5 palavras-chave em minúsculas.

Se a apuração não sustentar uma matéria, devolva title iniciando com "[SEM BASE]".`;

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.6,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          dek: { type: Type.STRING },
          category: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          body_html: { type: Type.STRING },
        },
        required: ['title', 'dek', 'category', 'tags', 'body_html'],
        propertyOrdering: ['title', 'dek', 'category', 'tags', 'body_html'],
      },
    },
  });

  const parsed = safeParse<GeneratedArticle>(res.text ?? '', {
    title: '',
    dek: '',
    category: input.category,
    tags: [],
    body_html: '',
  });

  return {
    ...parsed,
    category: input.category,
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
  };
}

function safeParse<T>(text: string, fallback: T): T {
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return fallback;
    return { ...fallback, ...JSON.parse(text.slice(start, end + 1)) } as T;
  } catch {
    return fallback;
  }
}
