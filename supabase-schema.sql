-- Schéma minimal pour l'espace de classe 1CE.
-- À exécuter dans Supabase > SQL Editor.
create table if not exists public.class_messages (
  id uuid primary key default gen_random_uuid(),
  class_code text not null default '1CE',
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.class_posts (
  id uuid primary key default gen_random_uuid(),
  class_code text not null default '1CE',
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.class_messages enable row level security;
alter table public.class_posts enable row level security;

drop policy if exists "1CE members read messages" on public.class_messages;
create policy "1CE members read messages" on public.class_messages for select to authenticated using (class_code = '1CE');
drop policy if exists "1CE members send messages" on public.class_messages;
create policy "1CE members send messages" on public.class_messages for insert to authenticated with check (class_code = '1CE' and author_id = (select auth.uid()));

drop policy if exists "1CE members read posts" on public.class_posts;
create policy "1CE members read posts" on public.class_posts for select to authenticated using (class_code = '1CE');
drop policy if exists "1CE members publish posts" on public.class_posts;
create policy "1CE members publish posts" on public.class_posts for insert to authenticated with check (class_code = '1CE' and author_id = (select auth.uid()));

create index if not exists class_messages_created_at_idx on public.class_messages (created_at desc);
create index if not exists class_posts_created_at_idx on public.class_posts (created_at desc);

