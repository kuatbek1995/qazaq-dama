"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Color, Coord, GameState, Move } from "@/lib/checkers/types";
import { isDarkSquare } from "@/lib/checkers/engine";
import { Piece } from "./Piece";
import { cn } from "@/lib/utils";

type Props = {
  state: GameState;
  selected: Coord | null;
  possibleMoves: Move[];
  onSquareClick: (r: number, c: number) => void;
  perspective?: Color;
  disabled?: boolean;
};

const CELL = 12.5; // 100 / 8

export function Board({
  state,
  selected,
  possibleMoves,
  onSquareClick,
  perspective = "white",
  disabled = false,
}: Props) {
  const destSet = new Set(possibleMoves.map((m) => `${m.to.r},${m.to.c}`));
  const captureSet = new Set<string>();
  for (const m of possibleMoves) {
    for (const cap of m.captures) {
      captureSet.add(`${cap.r},${cap.c}`);
    }
  }

  return (
    <div className="relative w-full max-w-[640px] mx-auto">
      {/* Decorative outer frame */}
      <div className="relative aspect-square rounded-2xl p-3 bg-gradient-to-br from-[#3a2810] via-[#5c3c0c] to-[#1c1206] shadow-[0_25px_60px_-10px_rgba(240,193,75,0.4),0_0_0_1px_rgba(240,193,75,0.3)]">
        {/* Inner frame */}
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-inner">
          {/* Squares grid */}
          <div className="grid grid-cols-8 grid-rows-8 absolute inset-0">
            {Array.from({ length: 64 }).map((_, i) => {
              // i iterates display positions; realR/realC are board coordinates that flip when viewing as black.
              const dispR = Math.floor(i / 8);
              const dispC = i % 8;
              const realR = perspective === "white" ? dispR : 7 - dispR;
              const realC = perspective === "white" ? dispC : 7 - dispC;
              const dark = isDarkSquare(realR, realC);
              const isSelected =
                selected?.r === realR && selected?.c === realC;
              const isDest = destSet.has(`${realR},${realC}`);
              const isCapTarget = captureSet.has(`${realR},${realC}`);
              return (
                <button
                  key={i}
                  onClick={() => !disabled && onSquareClick(realR, realC)}
                  className={cn(
                    "relative focus:outline-none transition-colors",
                    dark
                      ? "bg-[var(--board-dark)] hover:bg-[#264a72]"
                      : "bg-[var(--board-light)] hover:bg-[#f0dcae]",
                    isSelected && "ring-2 ring-inset ring-[var(--gold-bright)]",
                    isCapTarget && "bg-[#5a1f25]",
                  )}
                  style={{ gridColumn: dispC + 1, gridRow: dispR + 1 }}
                  aria-label={`Клетка ${String.fromCharCode(97 + realC)}${8 - realR}`}
                >
                  {dark && (
                    <span className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden>
                      <svg viewBox="0 0 40 40" className="w-full h-full">
                        <path
                          d="M20 4 L36 20 L20 36 L4 20 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-amber-200"
                        />
                        <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-200" />
                      </svg>
                    </span>
                  )}
                  {/* File/rank labels on edge */}
                  {dispC === 0 && (
                    <span
                      className={cn(
                        "absolute top-0.5 left-1 text-[10px] font-medium pointer-events-none",
                        dark ? "text-amber-300/70" : "text-stone-700/70",
                      )}
                    >
                      {8 - realR}
                    </span>
                  )}
                  {dispR === 7 && (
                    <span
                      className={cn(
                        "absolute bottom-0.5 right-1 text-[10px] font-medium pointer-events-none",
                        dark ? "text-amber-300/70" : "text-stone-700/70",
                      )}
                    >
                      {String.fromCharCode(97 + realC)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Move target indicators */}
          <div className="absolute inset-0 pointer-events-none">
            {possibleMoves.map((m, idx) => {
              const dispR = perspective === "white" ? m.to.r : 7 - m.to.r;
              const dispC = perspective === "white" ? m.to.c : 7 - m.to.c;
              const isCapture = m.captures.length > 0;
              return (
                <motion.div
                  key={`tgt-${idx}-${m.to.r}-${m.to.c}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: idx * 0.02, type: "spring", stiffness: 300 }}
                  className="absolute flex items-center justify-center"
                  style={{
                    width: `${CELL}%`,
                    height: `${CELL}%`,
                    top: `${dispR * CELL}%`,
                    left: `${dispC * CELL}%`,
                  }}
                >
                  {isCapture ? (
                    <div className="w-[60%] h-[60%] rounded-full border-4 border-[#ff5d6c] animate-pulse" />
                  ) : (
                    <div className="w-[28%] h-[28%] rounded-full bg-[var(--gold-bright)]/80 shadow-[0_0_18px_4px_rgba(255,217,112,0.7)]" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Pieces layer (parent passes clicks through to squares; buttons re-enable themselves) */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {state.board.flatMap((row, r) =>
                row.map((piece, c) =>
                  piece ? (
                    <Piece
                      key={piece.id}
                      piece={piece}
                      r={r}
                      c={c}
                      selected={selected?.r === r && selected?.c === c}
                      highlight={
                        !selected &&
                        piece.color === state.turn &&
                        possibleMoves.length === 0
                      }
                      perspective={perspective}
                      cellPct={CELL}
                      onClick={() => !disabled && onSquareClick(r, c)}
                    />
                  ) : null,
                ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
