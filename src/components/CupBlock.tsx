"use client";

import { motion } from "framer-motion";
import { Crown, Play, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  daysLeftInSeason,
  formatSeason,
  getCurrentChampion,
  getCurrentSeason,
} from "@/lib/champions";
import { fetchCupLeaderboard, type CupLeaderboardRow } from "@/lib/cup-scores";
import { loadIdentity, type Identity } from "@/lib/identity";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  // Called when user clicks the main "Play for prize" CTA. Should start an
  // AI-Hard game (the only Cup-qualifying mode). When omitted the block falls
  // back to a /champions link so the component stays usable on any page.
  onPlayForCup?: () => void;
};

export function CupBlock({ onPlayForCup }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const champion = getCurrentChampion();
  const season = getCurrentSeason();
  const daysLeft = daysLeftInSeason();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [rows, setRows] = useState<CupLeaderboardRow[] | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    setIdentity(loadIdentity());
  }, []);

  useEffect(() => {
    if (!configured) {
      setRows([]);
      return;
    }
    let alive = true;
    fetchCupLeaderboard(season)
      .then((r) => {
        if (alive) setRows(r);
      })
      .catch(() => {
        if (alive) setRows([]);
      });
    return () => {
      alive = false;
    };
  }, [configured, season]);

  const leader = rows && rows.length > 0 ? rows[0] : null;
  const myStanding = (() => {
    if (!rows || !identity) return null;
    const idx = rows.findIndex(
      (r) => r.nickname === identity.nickname && r.city === identity.city,
    );
    if (idx === -1) return { rank: 0, points: 0, total: rows.length };
    return { rank: idx + 1, points: rows[idx].points, total: rows.length };
  })();

  // When there's no data at all, collapse the two standings rows into a single
  // "be the first" empty-state pitch so the block stays compact for first-time
  // visitors (the most common case at launch).
  const hasAnyStandings =
    rows !== null && (leader !== null || (myStanding && myStanding.rank > 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="shrink-0 w-full max-w-3xl mb-6 rounded-2xl bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913] border border-gold/30 shadow-[0_16px_50px_-12px_rgba(240,193,75,0.35)] overflow-hidden"
    >
      {/* Top strip — season + days left */}
      <div className="px-5 py-2.5 bg-gradient-to-r from-gold/15 via-gold/8 to-transparent border-b border-gold/20 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
          <Trophy className="w-3.5 h-3.5 text-gold-bright" />
          <span className="text-gold-bright">{t("cup.title")}</span>
          <span className="text-ink-soft/70">·</span>
          <span className="text-ink">{formatSeason(season, locale)}</span>
        </div>
        <div className="text-[10px] text-ink-soft uppercase tracking-widest">
          {daysLeft === 0 ? t("cup.daysLeft.last") : t("cup.daysLeft", { n: daysLeft })}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col md:flex-row gap-5 items-start">
        {/* Photo */}
        <Link
          href="/champions"
          className="flex-shrink-0 group"
          aria-label={champion.name[locale]}
        >
          {champion.photo ? (
            <img
              src={champion.photo}
              alt={champion.name[locale]}
              loading="lazy"
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ring-2 ring-gold/40 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] group-hover:ring-gold transition-all"
            />
          ) : (
            <FallbackAvatar name={champion.name[locale]} />
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 w-full">
          <div className="font-display text-xl md:text-2xl font-bold text-ink leading-tight">
            {champion.name[locale]}
          </div>
          <div className="text-xs text-ink-soft/80 mt-0.5 mb-2.5">
            {champion.title[locale]}
          </div>
          {/* Gold prize pill — replaces the redundant "Главный приз сезона"
              label + champion meeting line. One pill says it all. */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full bg-gold/20 border border-gold/40 text-[11px] font-semibold text-gold-bright">
            <Trophy className="w-3 h-3" />
            {t("cup.prize.meeting")}
          </div>

          {/* Standings — only shown when we actually have data. */}
          {hasAnyStandings && (
            <div className="space-y-1 mb-4 text-xs">
              {leader && (
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy className="w-3 h-3 text-gold-bright flex-shrink-0" />
                  <span className="text-ink-soft/80 flex-shrink-0">
                    {t("cup.leader.label")}:
                  </span>
                  <span className="truncate min-w-0 text-ink">
                    {leader.nickname} ·{" "}
                    <span className="text-ink-soft">{leader.city}</span> ·{" "}
                    <span className="text-gold-bright font-bold">
                      {leader.points} {t("champions.points.suffix")}
                    </span>
                  </span>
                </div>
              )}
              {myStanding && myStanding.rank > 0 && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 text-kz-blue flex-shrink-0 flex items-center justify-center text-[10px]">
                    ★
                  </span>
                  <span className="text-ink-soft/80 flex-shrink-0">
                    {t("cup.myStanding.label")}:
                  </span>
                  <span className="truncate min-w-0 text-ink">
                    {t("cup.myStanding.ranked", {
                      rank: myStanding.rank,
                      total: myStanding.total,
                      points: myStanding.points,
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Big CTA — the load-bearing button. Falls back to /champions link
              when no onPlayForCup is wired (e.g. embedded outside the menu). */}
          {onPlayForCup ? (
            <motion.button
              onClick={onPlayForCup}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-bright via-gold to-gold-deep text-[#1c1206] font-bold text-sm md:text-base shadow-[0_8px_24px_-6px_rgba(240,193,75,0.6)] hover:shadow-[0_10px_30px_-6px_rgba(240,193,75,0.75)] transition-shadow"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              {t("cup.btn.playForPrize")}
            </motion.button>
          ) : (
            <Link
              href="/champions"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-bright via-gold to-gold-deep text-[#1c1206] font-bold text-sm md:text-base shadow-[0_8px_24px_-6px_rgba(240,193,75,0.6)] hover:shadow-[0_10px_30px_-6px_rgba(240,193,75,0.75)] transition-shadow"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              {t("cup.btn.playForPrize")}
            </Link>
          )}

          {/* Sub-hint row: rules summary + secondary link */}
          <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-ink-soft/70 flex-wrap">
            <span className="leading-relaxed">{t("cup.btn.subHint")}</span>
            <Link
              href="/champions"
              className="flex-shrink-0 font-semibold text-kz-blue hover:text-kz-blue/80 transition-colors"
            >
              {t("cup.btn.viewAll")}
            </Link>
          </div>

          {/* Standalone "set name" nudge when applicable. Stays out of the
              standings row so it doesn't compete with the big CTA visually. */}
          {!identity && (
            <div className="mt-3 text-[11px] text-ink-soft/60 italic">
              {t("cup.identityRequired")}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FallbackAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={cn(
        "w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center",
        "font-display font-bold text-3xl bg-gradient-to-br from-gold-bright via-gold to-gold-deep text-[#3a2406]",
        "ring-2 ring-gold/40 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] relative",
      )}
    >
      <span>{initials}</span>
      <Crown
        className="absolute -top-2 -right-2 w-4 h-4 text-[#3a2406]"
        fill="currentColor"
        fillOpacity={0.3}
      />
    </div>
  );
}
