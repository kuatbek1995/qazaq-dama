import { getSupabase } from "./supabase";
import { loadIdentity } from "./identity";

export type ScoreOpponent = "ai-easy" | "ai-medium" | "ai-hard" | "multiplayer" | "hotseat";
export type ScoreResult = "win" | "loss" | "draw";

export type ScoreEntry = {
  id?: string;
  nickname: string;
  city: string;
  result: ScoreResult;
  opponent: ScoreOpponent;
  duration_sec: number;
  moves: number;
  created_at?: string;
};

export type LeaderboardRow = {
  nickname: string;
  city: string;
  wins: number;
  losses: number;
  draws: number;
  total: number;
  score: number;
};

export async function recordScore(entry: Omit<ScoreEntry, "nickname" | "city" | "id" | "created_at">): Promise<void> {
  const supabase = getSupabase();
  const identity = loadIdentity();
  if (!supabase || !identity) return;
  try {
    await supabase.from("scores").insert({
      nickname: identity.nickname,
      city: identity.city,
      ...entry,
    });
  } catch {
    // swallow — score recording is best-effort
  }
}

export async function fetchLeaderboard(city?: string): Promise<LeaderboardRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    let query = supabase.from("scores").select("nickname, city, result").limit(2000);
    if (city) query = query.eq("city", city);
    const { data, error } = await query;
    if (error || !data) return [];
    const agg = new Map<string, LeaderboardRow>();
    for (const row of data as { nickname: string; city: string; result: ScoreResult }[]) {
      const key = `${row.nickname}|${row.city}`;
      if (!agg.has(key)) {
        agg.set(key, {
          nickname: row.nickname,
          city: row.city,
          wins: 0,
          losses: 0,
          draws: 0,
          total: 0,
          score: 0,
        });
      }
      const r = agg.get(key)!;
      r.total++;
      if (row.result === "win") r.wins++;
      else if (row.result === "loss") r.losses++;
      else r.draws++;
      r.score = r.wins * 3 + r.draws;
    }
    return Array.from(agg.values()).sort((a, b) => b.score - a.score || b.wins - a.wins);
  } catch {
    return [];
  }
}

export async function fetchCityStats(): Promise<{ city: string; players: number; wins: number }[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("scores").select("city, result, nickname").limit(5000);
    if (!data) return [];
    const byCity = new Map<string, { players: Set<string>; wins: number }>();
    for (const row of data as { city: string; result: ScoreResult; nickname: string }[]) {
      if (!byCity.has(row.city)) byCity.set(row.city, { players: new Set(), wins: 0 });
      const c = byCity.get(row.city)!;
      c.players.add(row.nickname);
      if (row.result === "win") c.wins++;
    }
    return Array.from(byCity.entries())
      .map(([city, v]) => ({ city, players: v.players.size, wins: v.wins }))
      .sort((a, b) => b.wins - a.wins);
  } catch {
    return [];
  }
}
