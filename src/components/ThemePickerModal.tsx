"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Lock, Sparkles, X } from "lucide-react";
import { THEMES, loadTheme, saveTheme, type BoardTheme } from "@/lib/pro";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  onClose: () => void;
  isPro: boolean;
};

export function ThemePickerModal({ onClose, isPro }: Props) {
  const t = useT();
  const savedTheme = loadTheme();
  const [current, setCurrent] = useState<BoardTheme>(savedTheme);
  const dirty = current !== savedTheme;

  const handlePick = (id: BoardTheme, locked: boolean) => {
    if (locked) return;
    setCurrent(id);
  };

  const handleApply = () => {
    saveTheme(current);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="relative bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913] border-2 border-gold/40 rounded-3xl p-6 max-w-md w-full shadow-[0_30px_80px_-10px_rgba(240,193,75,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4 text-ink-soft" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 mb-3">
            <Crown className="w-3 h-3 text-gold-bright" />
            <span className="text-xs font-bold text-gold uppercase tracking-wider">
              {isPro ? t("themes.badge.proActive") : t("themes.badge.noPro")}
            </span>
          </div>
          <h2 className="font-display text-3xl font-bold gold-text mb-1">{t("themes.title")}</h2>
          {!isPro && (
            <p className="text-xs text-ink-soft mt-2">
              <Sparkles className="inline w-3 h-3 text-gold-bright" /> {t("themes.hint")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((theme) => {
            const locked = theme.pro && !isPro;
            const active = current === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => handlePick(theme.id, locked)}
                disabled={locked}
                className={cn(
                  "relative rounded-xl border-2 p-3 transition-all text-left",
                  active
                    ? "border-gold shadow-[0_0_20px_-2px_rgba(240,193,75,0.6)]"
                    : "border-white/10 hover:border-white/30",
                  locked && "opacity-60 cursor-not-allowed",
                )}
              >
                {/* Mini board preview */}
                <div className="aspect-square rounded-md overflow-hidden grid grid-cols-4 grid-rows-4 mb-2">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const dark = (Math.floor(i / 4) + (i % 4)) % 2 === 1;
                    return (
                      <div
                        key={i}
                        style={{ background: dark ? PREVIEW[theme.id].dark : PREVIEW[theme.id].light }}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5">
                  {theme.pro && (
                    <Crown className="w-3 h-3 text-gold-bright flex-shrink-0" />
                  )}
                  <p className="text-sm font-semibold text-ink truncate">
                    {t(`themes.${theme.id}.name`)}
                  </p>
                </div>
                <p className="text-[11px] text-ink-soft/70 truncate">
                  {t(`themes.${theme.id}.sub`)}
                </p>

                {active && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#1c1206]" strokeWidth={3} />
                  </div>
                )}
                {locked && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                    <Lock className="w-3 h-3 text-ink-soft" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleApply}
          disabled={!dirty}
          className="w-full mt-5 px-5 py-3 rounded-xl bg-gradient-to-r from-gold-bright to-gold-deep text-[#1c1206] font-bold transition-all shadow-[0_10px_30px_-5px_rgba(240,193,75,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(240,193,75,0.7)] hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
        >
          {dirty ? t("themes.apply") : t("themes.alreadyApplied")}
        </button>
      </motion.div>
    </motion.div>
  );
}

const PREVIEW: Record<BoardTheme, { light: string; dark: string }> = {
  classic: { light: "#e9d2a0", dark: "#1a3a5c" },
  yurta: { light: "#f0d6a8", dark: "#7a2f12" },
  steppe: { light: "#dbe8b8", dark: "#2d5a2c" },
  tengri: { light: "#a8c5e0", dark: "#0e1638" },
};
