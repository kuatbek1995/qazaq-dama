"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import type { Piece as PieceType } from "@/lib/checkers/types";
import { cn } from "@/lib/utils";

type Props = {
  piece: PieceType;
  r: number;
  c: number;
  selected: boolean;
  highlight: boolean;
  perspective: "white" | "black";
  cellPct: number;
  onClick: () => void;
};

export function Piece({ piece, r, c, selected, highlight, perspective, cellPct, onClick }: Props) {
  // Position relative to board. If perspective is black, flip.
  const dispR = perspective === "white" ? r : 7 - r;
  const dispC = perspective === "white" ? c : 7 - c;

  const isWhite = piece.color === "white";

  return (
    <motion.button
      layoutId={piece.id}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        top: `${dispR * cellPct}%`,
        left: `${dispC * cellPct}%`,
      }}
      exit={{ scale: 0, opacity: 0, rotate: 180 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 26,
        opacity: { duration: 0.2 },
      }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "absolute flex items-center justify-center cursor-pointer group focus:outline-none pointer-events-auto",
        selected && "z-20",
        highlight && !selected && "z-10",
      )}
      style={{
        width: `${cellPct}%`,
        height: `${cellPct}%`,
      }}
    >
      <div
        className={cn(
          "relative rounded-full transition-all",
          "w-[78%] h-[78%]",
          isWhite
            ? "bg-[radial-gradient(circle_at_30%_25%,#fff8d0,#f0c14b_40%,#a87413_85%)] border-2 border-[#5c3c0c]"
            : "bg-[radial-gradient(circle_at_30%_25%,#5fb7d4,#00afca_35%,#003f55_80%)] border-2 border-[#001e2b]",
          selected && "ring-4 ring-[var(--gold-bright)] ring-offset-2 ring-offset-transparent shadow-[0_0_30px_8px_rgba(240,193,75,0.65)]",
          highlight && !selected && "shadow-[0_0_18px_4px_rgba(240,193,75,0.4)]",
        )}
      >
        {/* Inner ring detail */}
        <div
          className={cn(
            "absolute inset-[14%] rounded-full border opacity-50",
            isWhite ? "border-[#5c3c0c]/60" : "border-cyan-100/30",
          )}
        />
        {/* Crown for king */}
        {piece.king && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Crown
              className={cn(
                "w-1/2 h-1/2 drop-shadow-lg",
                isWhite ? "text-[#5c3c0c]" : "text-[var(--gold-bright)]",
              )}
              strokeWidth={2.5}
              fill="currentColor"
              fillOpacity={0.25}
            />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
