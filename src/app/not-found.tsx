import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-24 text-center">
      <p className="eyebrow text-brand">Erro 404</p>
      <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-6xl font-black text-ink">
        Página não encontrada
      </h1>
      <p className="mt-4 font-[family-name:var(--font-serif)] text-lg text-ink-2">
        O endereço não existe ou a matéria foi retirada do ar.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block bg-ink px-6 py-3 text-sm font-semibold tracking-wide text-paper uppercase transition-colors hover:bg-brand"
      >
        Voltar para a home
      </Link>
    </div>
  );
}
