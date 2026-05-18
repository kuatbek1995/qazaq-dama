-- Champions Cup v2 migration — only Hard-AI wins count, 1 point each.
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query → Run).
-- Safe to run multiple times: drops the old constraint first, then re-adds the strict one.

-- Wipe any old data that was recorded under the multi-mode rules.
-- The table is currently empty in production, this is just a safety belt.
delete from public.cup_scores where mode != 'ai-hard' or points != 1;

-- Replace the old points-by-mode constraint with the strict v2 one.
alter table public.cup_scores
  drop constraint if exists cup_scores_points_match_mode;

alter table public.cup_scores
  add constraint cup_scores_points_match_mode
  check (mode = 'ai-hard' and points = 1);
