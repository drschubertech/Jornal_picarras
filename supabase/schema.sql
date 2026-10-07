-- ============================================================
-- Schema do jornal — execute no SQL Editor do Supabase
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.articles (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  dek          text,
  body_html    text not null default '',
  category     text not null,
  tags         text[] not null default '{}',
  cover_url    text,
  cover_alt    text,
  author       text not null default 'Redação',
  status       text not null default 'draft'
               check (status in ('draft', 'published')),
  is_featured  boolean not null default false,
  source_type  text not null default 'manual'
               check (source_type in ('manual', 'ai')),
  sources      jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists articles_status_published_idx
  on public.articles (status, published_at desc);
create index if not exists articles_category_idx
  on public.articles (category, published_at desc);
create index if not exists articles_slug_idx
  on public.articles (slug);

-- updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.articles enable row level security;

drop policy if exists "leitura publica" on public.articles;
create policy "leitura publica" on public.articles
  for select using (status = 'published' or auth.uid() is not null);

drop policy if exists "escrita autenticada" on public.articles;
create policy "escrita autenticada" on public.articles
  for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ============================================================
-- Storage: bucket de capas
-- ============================================================
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "capas legiveis publicamente" on storage.objects;
create policy "capas legiveis publicamente" on storage.objects
  for select using (bucket_id = 'covers');

drop policy if exists "upload autenticado" on storage.objects;
create policy "upload autenticado" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'covers');

drop policy if exists "remocao autenticada" on storage.objects;
create policy "remocao autenticada" on storage.objects
  for delete to authenticated
  using (bucket_id = 'covers');
