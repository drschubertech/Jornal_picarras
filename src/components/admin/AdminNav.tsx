'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Matérias' },
  { href: '/admin/nova', label: '+ Nova matéria' },
  { href: '/admin/nova?aba=ia', label: 'Gerar com IA' },
  { href: '/', label: 'Ver site' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      {LINKS.map((link) => {
        const active =
          link.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(link.href.split('?')[0]) &&
              link.href.split('?')[0] !== '/admin';
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 font-semibold transition-colors ${
              active
                ? 'bg-ink text-paper'
                : 'text-ink-2 hover:bg-paper-3 hover:text-ink'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <button
        onClick={logout}
        className="ml-2 border border-rule-2 px-3 py-1.5 font-semibold text-ink-2 transition-colors hover:border-brand hover:text-brand"
      >
        Sair
      </button>
    </nav>
  );
}
