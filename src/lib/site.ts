export interface Category {
  slug: string;
  label: string;
  description: string;
}

export const SITE = {
  name: 'Jornal de Balneário Piçarras',
  shortName: 'JBP',
  tagline: 'Notícias de Balneário Piçarras e região',
  region: 'Litoral Norte de Santa Catarina',
  cities: [
    'Balneário Piçarras',
    'Penha',
    'Ilhota',
    'Riqueza',
    'Maracajá',
    'Sombrio',
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  editoria: 'Redação',
} as const;

export const CATEGORIES: Category[] = [
  {
    slug: 'policiais',
    label: 'Policiais',
    description: 'Ocorrências, segurança pública e operações na região.',
  },
  {
    slug: 'esportes',
    label: 'Esportes',
    description: 'Times, competições e vida esportiva do litoral norte.',
  },
  {
    slug: 'politica',
    label: 'Política',
    description: 'Poder público, decisões e representação da região.',
  },
  {
    slug: 'economia',
    label: 'Economia',
    description: 'Empregos, comércio, turismo e desenvolvimento local.',
  },
  {
    slug: 'sociedade',
    label: 'Sociedade',
    description: 'Comunidade, educação, saúde e acontecimentos do dia a dia.',
  },
  {
    slug: 'cultura',
    label: 'Cultura',
    description: 'Eventos, artistas, gastronomia e tradições da região.',
  },
  {
    slug: 'turismo',
    label: 'Turismo',
    description: 'Praias, temporada, receptivos e roteiros turísticos.',
  },
  {
    slug: 'ambiente',
    label: 'Ambiente',
    description: 'Meio ambiente, clima, fauna e flora do litoral.',
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryLabel(slug: string): string {
  return getCategory(slug)?.label ?? slug;
}
