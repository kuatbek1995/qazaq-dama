"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  RotateCcw,
  Home,
  Sparkles,
  Loader2,
  Bot,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import type { Color, Move } from "@/lib/checkers/types";
import { recordScore, type ScoreOpponent } from "@/lib/scores";
import { recordCupWin } from "@/lib/cup-scores";
import { formatSeason, getCurrentSeason } from "@/lib/champions";
import { loadIdentity, type Identity } from "@/lib/identity";
import { useLocale, useT } from "@/lib/i18n";

type Props = {
  winner: Color | "draw";
  yourColor: Color;
  onPlayAgain: () => void;
  onMenu: () => void;
  durationSec: number;
  moves: number;
  history?: Move[];
  opponent?: ScoreOpponent;
};

export function EndScreen({
  winner,
  yourColor,
  onPlayAgain,
  onMenu,
  durationSec,
  moves,
  history = [],
  opponent,
}: Props) {
  const t = useT();
  const { locale } = useLocale();
  const youWon = winner === yourColor;
  const isDraw = winner === "draw";
  const recordedRef = useRef(false);
  const [coachState, setCoachState] = useState<
    "idle" | "loading" | "ready" | "error" | "unavailable"
  >("idle");
  const [analysis, setAnalysis] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    setIdentity(loadIdentity());
  }, []);

  useEffect(() => {
    if (winner === "draw") return;
    const fire = () => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: youWon
          ? ["#f0c14b", "#ffd970", "#00afca", "#ffffff"]
          : ["#888888", "#aaaaaa"],
      });
    };
    fire();
    const t1 = setTimeout(fire, 350);
    const t2 = setTimeout(fire, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [winner, youWon]);

  useEffect(() => {
    if (recordedRef.current || !opponent) return;
    recordedRef.current = true;
    const result = isDraw ? "draw" : youWon ? "win" : "loss";

    // City leaderboard: only AI matches count. Hot-seat and multiplayer
    // can be friend-farmed so they'd pollute the city rankings.
    if (opponent !== "hotseat" && opponent !== "multiplayer") {
      recordScore({
        result,
        opponent,
        duration_sec: durationSec,
        moves,
      }).catch(() => {});
    }

    // Champions Cup: only Hard-AI wins count. recordCupWin internally filters
    // non-Hard modes, so the check below is purely about win + anti-farm.
    // Minimum thresholds prevent trivial farming (insta-surrender, etc.):
    // a real checkers match takes well over 8 moves and 30 seconds.
    if (result === "win" && moves >= 8 && durationSec >= 30) {
      recordCupWin(opponent).catch(() => {});
    }
  }, [opponent, isDraw, youWon, durationSec, moves]);

  async function requestCoach() {
    setCoachState("loading");
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ history, winner, yourColor, durationSec, locale }),
      });
      if (res.status === 503) {
        setCoachState("unavailable");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? t("end.error"));
        setCoachState("error");
        return;
      }
      setAnalysis(data.analysis ?? "");
      setCoachState("ready");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : t("end.error"));
      setCoachState("error");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913] border border-gold/30 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_20px_60px_-10px_rgba(240,193,75,0.4)] my-8"
      >
        <motion.div
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex w-20 h-20 rounded-full items-center justify-center mb-4 bg-gradient-to-br from-gold-bright to-gold-deep shadow-[0_0_40px_rgba(240,193,75,0.6)]"
        >
          <Trophy className="w-10 h-10 text-[#5c3c0c]" strokeWidth={2.5} />
        </motion.div>

        <h2 className="font-display text-5xl font-bold gold-text mb-2">
          {isDraw ? t("end.title.draw") : youWon ? t("end.title.win") : t("end.title.lose")}
        </h2>
        <p className="text-ink-soft mb-6">
          {isDraw
            ? t("end.subtitle.draw")
            : youWon
            ? t("end.subtitle.win")
            : t("end.subtitle.lose")}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-ink-soft text-xs">{t("end.moves")}</div>
            <div className="text-xl font-semibold text-ink">{moves}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-ink-soft text-xs">{t("end.time")}</div>
            <div className="text-xl font-semibold text-ink">
              {Math.floor(durationSec / 60)}:
              {(durationSec % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>

        <CupFeedback
          youWon={youWon}
          opponent={opponent}
          moves={moves}
          durationSec={durationSec}
          identity={identity}
          locale={locale}
          t={t}
        />

        {identity && opponent && opponent !== "hotseat" && opponent !== "multiplayer" && (
          <div className="mb-6 text-xs text-ink-soft/70">
            {t("end.savedTo")}{" "}
            <span className="text-gold">{identity.nickname}</span> ·{" "}
            {identity.city}
          </div>
        )}

        {/* AI Coach */}
        {history.length > 0 && (
          <div className="mb-6">
            <AnimatePresence mode="wait">
              {coachState === "idle" && (
                <motion.button
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={requestCoach}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-kz-blue/20 to-kz-blue/5 border border-kz-blue/40 hover:border-kz-blue hover:bg-kz-blue/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <Sparkles className="w-4 h-4 text-kz-blue" />
                  {t("end.coach.title")}
                </motion.button>
              )}

              {coachState === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-6 rounded-xl border border-kz-blue/30 bg-kz-blue/5 flex items-center justify-center gap-3 text-sm text-ink-soft"
                >
                  <Loader2 className="w-5 h-5 animate-spin text-kz-blue" />
                  {t("end.coach.thinking")}
                </motion.div>
              )}

              {coachState === "ready" && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-5 py-4 rounded-xl border border-kz-blue/30 bg-gradient-to-b from-kz-blue/10 to-transparent text-left text-sm text-ink whitespace-pre-wrap leading-relaxed"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-kz-blue mb-3">
                    <Bot className="w-3 h-3" />
                    {t("end.coach.label")}
                  </div>
                  {analysis}
                </motion.div>
              )}

              {coachState === "unavailable" && (
                <motion.div
                  key="unavail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-xs text-ink-soft"
                >
                  {t("end.coach.unavailable")}
                </motion.div>
              )}

              {coachState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/5 text-xs text-red-300"
                >
                  {t("end.errorPrefix")} {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onMenu}
            className="flex-1 px-4 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Home className="w-4 h-4" />{t("end.btn.menu")}
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-[#1c1206] hover:from-gold-bright hover:to-gold transition-colors flex items-center justify-center gap-2 text-sm font-semibold shadow-[0_8px_20px_-4px_rgba(240,193,75,0.5)]"
          >
            <RotateCcw className="w-4 h-4" />
            {t("end.btn.rematch")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CupFeedback({
  youWon,
  opponent,
  moves,
  durationSec,
  identity,
  locale,
  t,
}: {
  youWon: boolean;
  opponent: ScoreOpponent | undefined;
  moves: number;
  durationSec: number;
  identity: Identity | null;
  locale: "en" | "ru" | "kk";
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  // Win-only feedback — losses/draws aren't cup-eligible regardless of mode.
  if (!youWon || !opponent) return null;
  // Hot-seat and multiplayer are excluded from cup entirely; no UI noise either.
  if (opponent === "hotseat" || opponent === "multiplayer") return null;

  const season = formatSeason(getCurrentSeason(), locale);

  if (opponent === "ai-hard") {
    const qualifies = moves >= 8 && durationSec >= 30;
    if (qualifies && identity) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 220, damping: 18 }}
          className="mb-4 px-4 py-3 rounded-xl border border-gold/50 bg-gradient-to-r from-gold/25 via-gold/10 to-gold/5 shadow-[0_4px_16px_-4px_rgba(240,193,75,0.4)] flex items-center gap-3"
        >
          <Trophy className="w-5 h-5 text-gold-bright flex-shrink-0" />
          <div className="text-left min-w-0 flex-1">
            <div className="text-sm font-bold text-gold-bright">
              {t("end.cup.earned.title")}
            </div>
            <div className="text-[11px] text-ink-soft truncate">
              {t("end.cup.earned.sub", { season })}
            </div>
          </div>
        </motion.div>
      );
    }
    if (!identity) {
      return (
        <div className="mb-4 px-3 py-2 rounded-lg border border-kz-blue/30 bg-kz-blue/5 text-xs text-ink-soft text-center">
          {t("end.cup.needIdentity")}
        </div>
      );
    }
    // Won but too short — anti-farm
    return (
      <div className="mb-4 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-xs text-ink-soft/80 text-center">
        {t("end.cup.tooShort")}
      </div>
    );
  }

  // Won AI Easy / Medium — nudge towards Hard for cup points
  return (
    <div className="mb-4 px-3 py-2 rounded-lg border border-kz-blue/25 bg-kz-blue/5 text-xs text-ink-soft text-center">
      💡 {t("end.cup.playHard")}
    </div>
  );
}
