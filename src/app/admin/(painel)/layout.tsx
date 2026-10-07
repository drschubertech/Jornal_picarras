import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect('/admin/login');

  return (
    <div className="min-h-[70vh] bg-paper-2">
      <div className="mx-auto max-w-[1180px] px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-3">
          <div className="flex items-baseline gap-4">
            <Link
              href="/admin"
              className="font-[family-name:var(--font-playfair)] text-xl font-black text-ink hover:text-brand"
            >
              Painel da redação
            </Link>
            <span className="text-xs text-ink-3">{user.email}</span>
          </div>
          <AdminNav />
        </div>
        <div className="py-6">{children}</div>
      </div>
    </div>
  );
}
