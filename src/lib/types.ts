export type ArticleStatus = 'draft' | 'published';
export type SourceType = 'manual' | 'ai';

export interface ArticleSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  dek: string | null;
  body_html: string;
  category: string;
  tags: string[];
  cover_url: string | null;
  cover_alt: string | null;
  author: string;
  status: ArticleStatus;
  is_featured: boolean;
  source_type: SourceType;
  sources: ArticleSource[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ArticleInput = Partial<Article> & {
  title: string;
  category: string;
  body_html?: string;
};

export interface ResearchNotes {
  summary: string;
  notes: string[];
  sources: ArticleSource[];
  suggested_headline?: string;
}

export interface GeneratedArticle {
  title: string;
  dek: string;
  category: string;
  tags: string[];
  body_html: string;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('SEU-PROJETO'),
  );
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
