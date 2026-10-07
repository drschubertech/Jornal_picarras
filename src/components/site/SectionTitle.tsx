import Link from "next/link";

export function SectionTitle({
  title,
  href,
  kicker,
}: {
  title: string;
  href?: string;
  kicker?: string;
}) {
  const content = (
    <>
      {kicker && <span className="eyebrow text-brand">{kicker}</span>}
      <h2 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-black text-ink">
        {title}
      </h2>
    </>
  );

  return (
    <div className="mb-5 border-b-2 border-ink pb-2">
      {href ? (
        <Link href={href} className="block transition-colors hover:text-brand">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
