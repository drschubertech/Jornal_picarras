import type { Metadata } from 'next';
import { CATEGORIES, SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sobre o jornal',
  description: `Conheça o ${SITE.name}: missão, cobertura e cidades atendidas no ${SITE.region}.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[820px] px-4 py-12">
      <p className="eyebrow text-brand">Quem somos</p>
      <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-4xl leading-tight font-black text-ink sm:text-5xl">
        Sobre o {SITE.name}
      </h1>

      <div className="prose-jornal mt-8">
        <p>
          O {SITE.name} é um veículo digital de jornalismo regional dedicado a
          cobrir {SITE.cities.join(', ')} e as demais cidades do{' '}
          {SITE.region}. Nossa missão é manter a população informada sobre o que
          realmente importa no dia a dia da região: segurança, política,
          economia, esportes, cultura, turismo e meio ambiente.
        </p>

        <h2>Como fazemos jornalismo</h2>
        <p>
          A redação produz matérias manualmente no painel editorial e também
          aciona uma inteligência artificial que pesquisa na internet — portais
          de notícia, sites oficiais, redes sociais públicas da região e outros
          perfis disponíveis na busca web — para levantar fatos, datas e fontes.
        </p>
        <p>
          Nada vai ao ar automaticamente: toda matéria gerada com apoio de IA é
          aberta no editor, revisada e só então publicada. As fontes consultadas
          durante a apuração são exibidas ao final de cada matéria.
        </p>

        <h2>Editorias</h2>
        <ul>
          {CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <strong>{cat.label}</strong> — {cat.description}
            </li>
          ))}
        </ul>

        <h2>Contato e correções</h2>
        <p>
          Erros e pedidos de correção devem ser encaminhados à redação pelo
          painel do editor. O jornal responde pelo princípio da retificação
          transparente: correções são aplicadas na própria matéria, com data de
          atualização.
        </p>
      </div>
    </div>
  );
}
