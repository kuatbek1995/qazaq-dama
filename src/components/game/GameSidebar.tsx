"use client";

import { motion } from "framer-motion";
import { Bot, User, Users, Clock, Trophy } from "lucide-react";
import type { Color, GameState } from "@/lib/checkers/types";
import { countPieces } from "@/lib/checkers/engine";
import { cn } from "@/lib/utils";

type Props = {
  state: GameState;
  modeLabel: string;
  topLabel: string;
  bottomLabel: string;
  yourColor: Color;
  thinking?: boolean;
  timer?: { white: number; black: number };
};

export function GameSidebar({
  state,
  modeLabel,
  topLabel,
  bottomLabel,
  yourColor,
  thinking,
  timer,
}: Props) {
  const counts = countPieces(state.board);
  const blackCaptured = 12 - counts.black;
  const whiteCaptured = 12 - counts.white;
  const turn = state.turn;
  const opponentColor: Color = yourColor === "white" ? "black" : "white";

  function PlayerCard({
    color,
    label,
    captured,
    kings,
    isTurn,
    timeMs,
  }: {
    color: Color;
    label: string;
    captured: number;
    kings: number;
    isTurn: boolean;
    timeMs?: number;
  }) {
    const isWhite = color === "white";
    return (
      <motion.div
        animate={{
          scale: isTurn ? 1.02 : 1,
          opacity: state.winner ? 0.6 : isTurn ? 1 : 0.7,
        }}
        className={cn(
          "rounded-xl p-4 border transition-all",
          isTurn
            ? "border-[var(--gold)] bg-[var(--gold)]/5 shadow-[0_0_24px_-4px_rgba(240,193,75,0.5)]"
            : "border-white/10 bg-white/[0.02]",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex-shrink-0",
              isWhite
                ? "bg-[radial-gradient(circle_at_30%_25%,#fff8d0,#f0c14b_40%,#a87413_85%)] border-2 border-[#5c3c0c]"
                : "bg-[radial-gradient(circle_at_30%_25%,#5fb7d4,#00afca_35%,#003f55_80%)] border-2 border-[#001e2b]",
            )}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{label}</div>
            <div className="text-xs text-ink-soft flex gap-2">
              <span>{12 - captured} шашек</span>
              {kings > 0 && <span className="text-gold">👑 {kings}</span>}
            </div>
          </div>
          {timeMs !== undefined && (
            <div
              className={cn(
                "text-lg font-mono tabular-nums tracking-tight",
                timeMs < 30_000 && isTurn ? "text-[var(--danger)] animate-pulse" : "",
                isTurn ? "text-[var(--gold-bright)]" : "text-ink-soft",
              )}
            >
              <Clock className="inline w-3.5 h-3.5 mr-1" />
              {formatTime(timeMs)}
            </div>
          )}
        </div>
        {captured > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from({ length: captured }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "w-3 h-3 rounded-full",
                  isWhite
                    ? "bg-[#1e3a5f] border border-[#001e2b]"
                    : "bg-[#f0c14b] border border-[#5c3c0c]",
                )}
              />
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-ink-soft">{modeLabel}</span>
        {thinking && (
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-xs text-gold flex items-center gap-1.5"
          >
            <Bot className="w-3 h-3" />
            ИИ думает…
          </motion.span>
        )}
      </div>

      <PlayerCard
        color={opponentColor}
        label={topLabel}
        captured={opponentColor === "white" ? whiteCaptured : blackCaptured}
        kings={opponentColor === "white" ? counts.whiteKings : counts.blackKings}
        isTurn={turn === opponentColor && !state.winner}
        timeMs={timer ? timer[opponentColor] : undefined}
      />

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-xs uppercase tracking-widest text-ink-soft mb-2 flex items-center gap-2">
          <Trophy className="w-3 h-3" />
          История ходов
        </div>
        {state.history.length === 0 ? (
          <div className="text-sm text-ink-soft/60 italic">Партия только началась</div>
        ) : (
          <div className="max-h-32 overflow-y-auto text-xs font-mono space-y-0.5">
            {state.history.slice(-10).map((m, i) => {
              const moveNum = state.history.length - state.history.slice(-10).length + i + 1;
              return (
                <div key={i} className="flex gap-2">
                  <span className="text-ink-soft w-6">{moveNum}.</span>
                  <span className="text-ink">
                    {coordToNotation(m.from)}
                    {m.captures.length > 0 ? ":" : "-"}
                    {coordToNotation(m.to)}
                    {m.becomesKing && " 👑"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PlayerCard
        color={yourColor}
        label={bottomLabel}
        captured={yourColor === "white" ? whiteCaptured : blackCaptured}
        kings={yourColor === "white" ? counts.whiteKings : counts.blackKings}
        isTurn={turn === yourColor && !state.winner}
        timeMs={timer ? timer[yourColor] : undefined}
      />
    </div>
  );
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function coordToNotation(c: { r: number; c: number }): string {
  return `${String.fromCharCode(97 + c.c)}${8 - c.r}`;
}
