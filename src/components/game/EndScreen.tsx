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
import { loadIdentity, type Identity } from "@/lib/identity";

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
    if (recordedRef.current || !opponent || opponent === "hotseat") return;
    recordedRef.current = true;
    const result = isDraw ? "draw" : youWon ? "win" : "loss";
    recordScore({
      result,
      opponent,
      duration_sec: durationSec,
      moves,
    }).catch(() => {});
  }, [opponent, isDraw, youWon, durationSec, moves]);

  async function requestCoach() {
    setCoachState("loading");
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ history, winner, yourColor, durationSec }),
      });
      if (res.status === 503) {
        setCoachState("unavailable");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Ошибка");
        setCoachState("error");
        return;
      }
      setAnalysis(data.analysis ?? "");
      setCoachState("ready");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "unknown");
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
          {isDraw ? "Ничья!" : youWon ? "Победа!" : "Поражение"}
        </h2>
        <p className="text-ink-soft mb-6">
          {isDraw
            ? "Достойная партия для обеих сторон"
            : youWon
            ? "Жеңіс сенімен!"
            : "Реванш?"}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-ink-soft text-xs">Ходов</div>
            <div className="text-xl font-semibold text-ink">{moves}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-ink-soft text-xs">Время</div>
            <div className="text-xl font-semibold text-ink">
              {Math.floor(durationSec / 60)}:
              {(durationSec % 60).toString().padStart(2, "0")}
            </div>
          </div>
        </div>

        {identity && opponent && opponent !== "hotseat" && (
          <div className="mb-6 text-xs text-ink-soft/70">
            Результат сохранён в лидерборд:{" "}
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
                  Разбор партии от AI-тренера
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
                  Тренер думает…
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
                    AI-тренер
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
                  AI-тренер недоступен — нет API-ключа. (v2)
                </motion.div>
              )}

              {coachState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/5 text-xs text-red-300"
                >
                  Ошибка: {errorMsg}
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
            <Home className="w-4 h-4" />В меню
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-[#1c1206] hover:from-gold-bright hover:to-gold transition-colors flex items-center justify-center gap-2 text-sm font-semibold shadow-[0_8px_20px_-4px_rgba(240,193,75,0.5)]"
          >
            <RotateCcw className="w-4 h-4" />
            Реванш
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
