-- Скопируй и выполни этот SQL в Supabase Dashboard:
-- Project → SQL Editor → New query → вставь → Run.

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (length(nickname) between 2 and 20),
  city text not null check (length(city) between 2 and 50),
  result text not null check (result in ('win', 'loss', 'draw')),
  opponent text not null check (opponent in ('ai-easy', 'ai-medium', 'ai-hard', 'multiplayer')),
  duration_sec int not null default 0,
  moves int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists scores_city_idx on public.scores (city);
create index if not exists scores_created_at_idx on public.scores (created_at desc);

-- Включаем RLS, открываем read + insert для всех (анонимный прототип).
alter table public.scores enable row level security;

drop policy if exists "anyone can read scores" on public.scores;
create policy "anyone can read scores"
  on public.scores
  for select
  using (true);

drop policy if exists "anyone can insert scores" on public.scores;
create policy "anyone can insert scores"
  on public.scores
  for insert
  with check (
    length(nickname) between 2 and 20
    and length(city) between 2 and 50
  );
