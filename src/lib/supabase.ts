import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

function getKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabase(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getKey();
  if (!url || !key) return null;
  cached = createClient(url, key, {
    realtime: { params: { eventsPerSecond: 20 } },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getKey());
}

export const KZ_CITIES = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганды",
  "Актобе",
  "Тараз",
  "Павлодар",
  "Усть-Каменогорск",
  "Семей",
  "Атырау",
  "Костанай",
  "Кызылорда",
  "Уральск",
  "Петропавловск",
  "Туркестан",
  "Актау",
  "Темиртау",
  "Талдыкорган",
  "Экибастуз",
  "Рудный",
] as const;

export type KzCity = (typeof KZ_CITIES)[number];
