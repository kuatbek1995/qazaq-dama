-- Champions Cup — отдельная таблица для очков турнира.
-- Скопируй и выполни этот SQL в Supabase Dashboard:
-- Project → SQL Editor → New query → вставь → Run.
--
-- Эта таблица НЕ заменяет `scores` (city leaderboard).
-- `scores` — для городского лидерборда (только vs AI, без hot-seat/multiplayer).
-- `cup_scores` — для Champions Cup (ВСЕ режимы, включая hot-seat/multiplayer).

create table if not exists public.cup_scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (length(nickname) between 2 and 20),
  city text not null check (length(city) between 2 and 50),
  mode text not null check (mode in ('hotseat', 'ai-easy', 'ai-medium', 'ai-hard', 'multiplayer')),
  points int not null,
  season text not null check (season ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  created_at timestamptz not null default now(),
  -- Bind points to mode so a tampered client cannot post inflated scores.
  -- Must mirror CUP_POINTS in src/lib/cup-scores.ts.
  constraint cup_scores_points_match_mode check (
    (mode = 'hotseat' and points = 1)
    or (mode = 'ai-easy' and points = 1)
    or (mode = 'ai-medium' and points = 1)
    or (mode = 'ai-hard' and points = 2)
    or (mode = 'multiplayer' and points = 3)
  )
);

create index if not exists cup_scores_season_idx on public.cup_scores (season);
create index if not exists cup_scores_season_nick_idx on public.cup_scores (season, nickname);
create index if not exists cup_scores_created_at_idx on public.cup_scores (created_at desc);

alter table public.cup_scores enable row level security;

drop policy if exists "anyone can read cup_scores" on public.cup_scores;
create policy "anyone can read cup_scores"
  on public.cup_scores
  for select
  using (true);

drop policy if exists "anyone can insert cup_scores" on public.cup_scores;
create policy "anyone can insert cup_scores"
  on public.cup_scores
  for insert
  with check (
    length(nickname) between 2 and 20
    and length(city) between 2 and 50
    and season ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'
    -- mode/points pairing already enforced by table check constraint above
  );
