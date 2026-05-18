import { getSupabase } from "./supabase";
import { loadIdentity } from "./identity";
import { getCurrentSeason } from "./champions";
import type { ScoreOpponent } from "./scores";

// Cup tracks every mode (including hot-seat and multiplayer), unlike the city
// leaderboard which only counts AI matches. Reuses ScoreOpponent so the type
// flows cleanly from EndScreen → recordCupWin without coercion.
export type CupMode = ScoreOpponent;

export type CupEntry = {
  id?: string;
  nickname: string;
  city: string;
  mode: CupMode;
  points: number;
  season: string;
  created_at?: string;
};

export type CupLeaderboardRow = {
  nickname: string;
  city: string;
  points: number;
  games: number;
};

// Cup points by mode.
//   1× — casual modes where the result is least competitive
//        (hotseat, easy/medium AI both can be farmed)
//   2× — Hard AI: requires real skill against minimax + alpha-beta at full depth
//   3× — Multiplayer: a human opponent, most viral / most valuable signal
export const CUP_POINTS: Record<CupMode, number> = {
  hotseat: 1,
  "ai-easy": 1,
  "ai-medium": 1,
  "ai-hard": 2,
  multiplayer: 3,
};

/**
 * Records a Cup win. Called from EndScreen after any victorious match.
 * Best-effort: silently no-ops if Supabase isn't configured or the user has no identity.
 * NOTE: only winning matches earn cup points — losses and draws are intentionally skipped.
 */
export async function recordCupWin(mode: CupMode): Promise<void> {
  const supabase = getSupabase();
  const identity = loadIdentity();
  if (!supabase || !identity) return;
  const points = CUP_POINTS[mode];
  const season = getCurrentSeason();
  try {
    await supabase.from("cup_scores").insert({
      nickname: identity.nickname,
      city: identity.city,
      mode,
      points,
      season,
    });
  } catch {
    // swallow — best effort
  }
}

/**
 * Fetches the cup leaderboard for the given season.
 * Aggregates points by (nickname, city). Sorted descending by points.
 */
export async function fetchCupLeaderboard(season: string): Promise<CupLeaderboardRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("cup_scores")
      .select("nickname, city, points")
      .eq("season", season)
      .limit(5000);
    if (error || !data) return [];
    const agg = new Map<string, CupLeaderboardRow>();
    for (const row of data as { nickname: string; city: string; points: number }[]) {
      const key = `${row.nickname}|${row.city}`;
      if (!agg.has(key)) {
        agg.set(key, {
          nickname: row.nickname,
          city: row.city,
          points: 0,
          games: 0,
        });
      }
      const r = agg.get(key)!;
      r.points += row.points;
      r.games += 1;
    }
    return Array.from(agg.values()).sort(
      (a, b) => b.points - a.points || b.games - a.games,
    );
  } catch {
    return [];
  }
}

/**
 * Convenience helper: rank + stats for the given player in the current season.
 * Returns null if not enough data is available.
 */
export async function getMyCupStanding(
  nickname: string,
  city: string,
  season: string,
): Promise<{ rank: number; points: number; games: number; totalPlayers: number } | null> {
  const rows = await fetchCupLeaderboard(season);
  if (rows.length === 0) return null;
  const idx = rows.findIndex((r) => r.nickname === nickname && r.city === city);
  if (idx === -1) {
    return { rank: 0, points: 0, games: 0, totalPlayers: rows.length };
  }
  return {
    rank: idx + 1,
    points: rows[idx].points,
    games: rows[idx].games,
    totalPlayers: rows.length,
  };
}
