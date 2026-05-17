"use client";

import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCityStats, fetchLeaderboard, type LeaderboardRow } from "@/lib/scores";
import { isSupabaseConfigured, KZ_CITIES } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [cityStats, setCityStats] = useState<{ city: string; players: number; wins: number }[]>([]);
  const [city, setCity] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([fetchLeaderboard(city || undefined), fetchCityStats()])
      .then(([leader, stats]) => {
        setRows(leader);
        setCityStats(stats);
      })
      .catch(() => {
        setRows([]);
        setCityStats([]);
      })
      .finally(() => setLoading(false));
  }, [city, configured]);

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-ink-soft hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />В меню
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center bg-gradient-to-br from-gold-bright to-gold-deep mb-4 shadow-[0_0_40px_rgba(240,193,75,0.4)]">
          <Trophy className="w-8 h-8 text-[#5c3c0c]" />
        </div>
        <h1 className="font-display text-5xl font-bold gold-text mb-2">Лидерборд городов</h1>
        <p className="text-ink-soft">Топ игроков Қазақстана · обновляется в реальном времени</p>
      </motion.div>

      {!configured ? (
        <div className="text-center p-10 rounded-2xl border border-white/10 bg-white/[0.02]">
          <p className="text-ink-soft">
            Лидерборд активируется когда подключим Supabase.{" "}
            <br />
            Сейчас работают: <strong>против ИИ</strong> и <strong>hot-seat</strong>.
          </p>
        </div>
      ) : loading ? (
        <div className="text-center text-ink-soft py-10">Загрузка…</div>
      ) : rows.length === 0 ? (
        <div className="text-center p-10 rounded-2xl border border-white/10 bg-white/[0.02]">
          <p className="text-ink-soft mb-2">Пока никто не сыграл партию.</p>
          <p className="text-sm text-ink-soft/70">Будь первым в истории Qazaq Dama!</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setCity("")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  !city
                    ? "bg-gold text-[#1c1206]"
                    : "bg-white/5 text-ink-soft hover:bg-white/10",
                )}
              >
                Весь Қазақстан
              </button>
              {KZ_CITIES.slice(0, 9).map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    city === c
                      ? "bg-gold text-[#1c1206]"
                      : "bg-white/5 text-ink-soft hover:bg-white/10",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="grid grid-cols-[40px_1fr_80px_60px_60px_60px] gap-3 px-4 py-3 text-xs uppercase tracking-widest text-ink-soft border-b border-white/10">
                <div>#</div>
                <div>Игрок</div>
                <div className="text-right">Очки</div>
                <div className="text-right">Победы</div>
                <div className="text-right">Игры</div>
                <div className="text-right">% побед</div>
              </div>
              {rows.slice(0, 50).map((row, i) => (
                <motion.div
                  key={`${row.nickname}-${row.city}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    "grid grid-cols-[40px_1fr_80px_60px_60px_60px] gap-3 px-4 py-3 border-b border-white/5 last:border-0 items-center text-sm",
                    i === 0 && "bg-gradient-to-r from-gold/10 to-transparent",
                    i === 1 && "bg-gradient-to-r from-white/5 to-transparent",
                    i === 2 && "bg-gradient-to-r from-amber-700/10 to-transparent",
                  )}
                >
                  <div className={cn("font-mono text-sm", i < 3 ? "text-gold-bright" : "text-ink-soft")}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{row.nickname}</div>
                    <div className="text-xs text-ink-soft flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {row.city}
                    </div>
                  </div>
                  <div className="text-right font-mono font-semibold text-gold-bright">{row.score}</div>
                  <div className="text-right font-mono text-ink">{row.wins}</div>
                  <div className="text-right font-mono text-ink-soft">{row.total}</div>
                  <div className="text-right font-mono text-ink-soft">
                    {row.total > 0 ? Math.round((row.wins / row.total) * 100) : 0}%
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="text-xs uppercase tracking-widest text-ink-soft mb-3 flex items-center gap-2">
                <Users className="w-3 h-3" /> Топ городов
              </div>
              <div className="space-y-3">
                {cityStats.slice(0, 8).map((s, i) => (
                  <div key={s.city} className="flex items-center gap-3">
                    <div className="text-sm font-mono text-ink-soft w-5">{i + 1}.</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{s.city}</div>
                      <div className="text-xs text-ink-soft">
                        {s.players} игроков · {s.wins} побед
                      </div>
                    </div>
                    <div className="text-xs text-gold-bright font-mono">{s.wins}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
