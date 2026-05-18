"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Crown, ExternalLink, MapPin, Trophy, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CHAMPIONS,
  daysLeftInSeason,
  formatSeason,
  getChampionForSeason,
  getCurrentSeason,
  type Champion,
} from "@/lib/champions";
import { CUP_POINTS, fetchCupLeaderboard, type CupLeaderboardRow } from "@/lib/cup-scores";
import { loadIdentity, type Identity } from "@/lib/identity";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useLocale, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ChampionsView() {
  const t = useT();
  const { locale } = useLocale();
  const currentSeason = getCurrentSeason();
  const currentChampion = getChampionForSeason(currentSeason);
  const daysLeft = daysLeftInSeason();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [rows, setRows] = useState<CupLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    setIdentity(loadIdentity());
  }, []);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchCupLeaderboard(currentSeason)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [configured, currentSeason]);

  // Rotation order: current first, then upcoming seasons.
  const rotation = useMemo(() => {
    const currentIdx = CHAMPIONS.findIndex((c) => c.id === currentChampion.id);
    const ordered: { champion: Champion; offset: number }[] = [];
    for (let i = 0; i < CHAMPIONS.length; i++) {
      const offset = i;
      const idx = (currentIdx + i) % CHAMPIONS.length;
      ordered.push({ champion: CHAMPIONS[idx], offset });
    }
    return ordered;
  }, [currentChampion.id]);

  const upcoming = rotation.slice(1);

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-ink-soft hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("champions.back")}
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center bg-gradient-to-br from-gold-bright to-gold-deep mb-4 shadow-[0_0_40px_rgba(240,193,75,0.4)]">
          <Crown className="w-8 h-8 text-[#5c3c0c]" />
        </div>
        <h1 className="font-display text-5xl font-bold gold-text mb-2">
          {t("champions.title")}
        </h1>
        <p className="text-ink-soft">{t("champions.subtitle")}</p>
      </motion.div>

      {/* Current season hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-gold-bright animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest text-gold font-bold">
            {t("champions.season.current")} · {formatSeason(currentSeason, locale)}
          </span>
        </div>
        <ChampionHero
          champion={currentChampion}
          locale={locale}
          daysLeft={daysLeft}
          t={t}
        />
      </motion.div>

      {/* About + points table */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-kz-blue/10 to-kz-blue/5 border border-kz-blue/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-kz-blue" />
            <h2 className="font-display text-lg font-semibold text-ink">
              {t("champions.about.title")}
            </h2>
          </div>
          <p className="text-sm text-ink-soft/90 leading-relaxed">
            {t("champions.about.body")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20"
        >
          <h2 className="font-display text-lg font-semibold text-ink mb-3">
            {t("champions.points.title")}
          </h2>
          <div className="space-y-1.5 text-sm">
            <PointRow label={t("champions.points.hotseat")} points={CUP_POINTS.hotseat} suffix={t("champions.points.suffix")} />
            <PointRow label={t("champions.points.aiEasy")} points={CUP_POINTS["ai-easy"]} suffix={t("champions.points.suffix")} />
            <PointRow label={t("champions.points.aiMedium")} points={CUP_POINTS["ai-medium"]} suffix={t("champions.points.suffix")} />
            <PointRow label={t("champions.points.aiHard")} points={CUP_POINTS["ai-hard"]} suffix={t("champions.points.suffix")} />
            <PointRow label={t("champions.points.multi")} points={CUP_POINTS.multiplayer} suffix={t("champions.points.suffix")} highlight />
          </div>
        </motion.div>
      </div>

      {/* Season standings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-10"
      >
        <h2 className="font-display text-2xl font-semibold text-ink mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold-bright" />
          {t("champions.standings.title")}
        </h2>
        <StandingsTable
          rows={rows}
          loading={loading}
          configured={configured}
          identity={identity}
          t={t}
        />
      </motion.div>

      {/* Upcoming seasons rotation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-10"
      >
        <h2 className="font-display text-2xl font-semibold text-ink mb-4">
          {t("champions.season.upcoming")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {upcoming.map(({ champion, offset }) => {
            const seasonId = nextSeason(currentSeason, offset);
            return (
              <ChampionCard
                key={champion.id}
                champion={champion}
                seasonLabel={formatSeason(seasonId, locale)}
                locale={locale}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function ChampionHero({
  champion,
  locale,
  daysLeft,
  t,
}: {
  champion: Champion;
  locale: "en" | "ru" | "kk";
  daysLeft: number;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913] border border-gold/30 shadow-[0_20px_60px_-10px_rgba(240,193,75,0.3)] overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 flex-shrink-0 bg-gradient-to-br from-gold/10 to-transparent flex items-center justify-center p-6 md:p-8">
          <ChampionAvatar champion={champion} size="xl" />
        </div>
        <div className="flex-1 p-6 md:p-8">
          <h3 className="font-display text-3xl md:text-4xl font-bold text-ink mb-2">
            {champion.name[locale]}
          </h3>
          <p className="text-gold-bright text-sm md:text-base font-semibold mb-4">
            {champion.title[locale]}
          </p>

          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-ink-soft">
              {t("champions.fide.label")} {champion.fideRating}
            </span>
            <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-ink-soft">
              {t("champions.born.label")} {champion.bornYear}
            </span>
          </div>

          <p className="text-sm text-ink/90 leading-relaxed mb-4">
            {champion.bio[locale]}
          </p>

          <div className="rounded-xl p-4 bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/30 mb-4">
            <div className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1">
              {t("cup.prize.label")}
            </div>
            <div className="text-base font-semibold text-ink mb-1">
              {t("cup.prize.meeting")}
            </div>
            <div className="text-xs text-ink-soft/80 leading-snug">
              {t("cup.prize.disclaimer")}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-ink-soft">
            <div>
              {daysLeft === 0
                ? t("cup.daysLeft.last")
                : t("cup.daysLeft", { n: daysLeft })}
            </div>
            <a
              href={champion.wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-kz-blue hover:text-kz-blue/80 transition-colors"
            >
              {t("champions.wiki")}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChampionCard({
  champion,
  seasonLabel,
  locale,
}: {
  champion: Champion;
  seasonLabel: string;
  locale: "en" | "ru" | "kk";
}) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-gold/30 transition-colors text-center">
      <div className="mb-2 flex justify-center">
        <ChampionAvatar champion={champion} size="sm" />
      </div>
      <div className="text-[9px] uppercase tracking-widest text-ink-soft/70 font-bold mb-1">
        {seasonLabel}
      </div>
      <div className="text-sm font-semibold text-ink leading-tight">
        {champion.name[locale]}
      </div>
    </div>
  );
}

function ChampionAvatar({
  champion,
  size,
}: {
  champion: Champion;
  size: "sm" | "md" | "xl";
}) {
  const dims = {
    sm: "w-16 h-16 text-base",
    md: "w-24 h-24 text-xl",
    xl: "w-40 h-40 md:w-52 md:h-52 text-5xl",
  }[size];

  if (champion.photo) {
    return (
      <img
        src={champion.photo}
        alt={champion.name.en}
        loading="lazy"
        className={cn(
          "rounded-2xl object-cover ring-2 ring-gold/30 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]",
          dims,
        )}
      />
    );
  }

  // Stylized initials fallback. Uses Cyrillic-first initials when available.
  const enParts = champion.name.en.split(" ");
  const initials = enParts
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-2xl flex items-center justify-center font-display font-bold bg-gradient-to-br from-gold-bright via-gold to-gold-deep text-[#3a2406] ring-2 ring-gold/40 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] relative",
        dims,
      )}
      aria-label={champion.name.en}
    >
      <span>{initials}</span>
      <Crown
        className={cn(
          "absolute text-[#3a2406]",
          size === "xl" ? "w-7 h-7 -top-3 -right-3" : "w-3.5 h-3.5 -top-1.5 -right-1.5",
        )}
        fill="currentColor"
        fillOpacity={0.3}
      />
    </div>
  );
}

function PointRow({
  label,
  points,
  suffix,
  highlight,
}: {
  label: string;
  points: number;
  suffix: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg",
        highlight ? "bg-gold/15 border border-gold/30" : "bg-white/[0.03]",
      )}
    >
      <span className={cn("text-ink", highlight && "font-semibold")}>{label}</span>
      <span
        className={cn(
          "font-bold tabular-nums",
          highlight ? "text-gold-bright" : "text-ink-soft",
        )}
      >
        ×{points} {suffix}
      </span>
    </div>
  );
}

function StandingsTable({
  rows,
  loading,
  configured,
  identity,
  t,
}: {
  rows: CupLeaderboardRow[];
  loading: boolean;
  configured: boolean;
  identity: Identity | null;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  if (!configured) {
    return (
      <div className="text-center p-8 rounded-2xl border border-white/10 bg-white/[0.02] text-ink-soft text-sm">
        {t("champions.standings.notConfigured")}
      </div>
    );
  }
  if (loading) {
    return (
      <div className="text-center py-8 text-ink-soft text-sm">{t("lb.loading")}</div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="text-center p-8 rounded-2xl border border-white/10 bg-white/[0.02] text-ink-soft text-sm">
        {t("champions.standings.empty")}
      </div>
    );
  }

  const top = rows.slice(0, 10);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.03] text-[11px] uppercase tracking-widest text-ink-soft">
          <tr>
            <th className="px-4 py-3 text-left w-12">{t("champions.standings.col.rank")}</th>
            <th className="px-4 py-3 text-left">{t("champions.standings.col.player")}</th>
            <th className="px-4 py-3 text-right">{t("champions.standings.col.points")}</th>
            <th className="px-4 py-3 text-right">{t("champions.standings.col.wins")}</th>
          </tr>
        </thead>
        <tbody>
          {top.map((row, idx) => {
            const isMe =
              identity &&
              row.nickname === identity.nickname &&
              row.city === identity.city;
            const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
            return (
              <tr
                key={`${row.nickname}|${row.city}`}
                className={cn(
                  "border-t border-white/5",
                  isMe ? "bg-gold/10" : "hover:bg-white/[0.02]",
                )}
              >
                <td className="px-4 py-3 font-bold text-ink-soft tabular-nums">
                  {medal ?? idx + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-[10px] font-bold text-gold-bright uppercase flex-shrink-0">
                      {row.nickname.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "font-medium truncate",
                          isMe ? "text-gold-bright" : "text-ink",
                        )}
                      >
                        {row.nickname}
                        {isMe && (
                          <span className="ml-1.5 text-[10px] uppercase tracking-widest text-gold">
                            ({t("champions.standings.you")})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-soft flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {row.city}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-bold text-gold-bright tabular-nums">
                  {row.points}
                </td>
                <td className="px-4 py-3 text-right text-ink-soft tabular-nums">
                  {row.games}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function nextSeason(current: string, offset: number): string {
  const [yStr, mStr] = current.split("-");
  const y = Number.parseInt(yStr, 10);
  const m = Number.parseInt(mStr, 10);
  const total = (y * 12 + (m - 1)) + offset;
  const newY = Math.floor(total / 12);
  const newM = (total % 12) + 1;
  return `${newY}-${newM.toString().padStart(2, "0")}`;
}
