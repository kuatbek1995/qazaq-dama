"use client";

import { motion } from "framer-motion";
import { Check, Globe } from "lucide-react";
import { LOCALE_INFO, LOCALES, useLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  onClose: () => void;
  forced?: boolean;
};

export function LanguagePickerModal({ onClose, forced = false }: Props) {
  const { locale, setLocale, markPicked } = useLocale();

  const handlePick = (l: Locale) => {
    setLocale(l);
  };

  const handleContinue = () => {
    markPicked();
    onClose();
  };

  const title =
    locale === "en"
      ? "Select your language"
      : locale === "ru"
      ? "Выберите язык"
      : "Тілді таңдаңыз";

  const subtitle =
    locale === "en"
      ? "You can change it anytime"
      : locale === "ru"
      ? "Сменить можно в любой момент"
      : "Кез келген уақытта өзгерте аласыз";

  const cta =
    locale === "en" ? "Continue" : locale === "ru" ? "Продолжить" : "Жалғастыру";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      onClick={forced ? undefined : onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="relative bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913] border-2 border-gold/40 rounded-3xl p-7 max-w-sm w-full shadow-[0_30px_80px_-10px_rgba(240,193,75,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-bright via-gold to-gold-deep flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(240,193,75,0.5)]"
        >
          <Globe className="w-7 h-7 text-[#1c1206]" strokeWidth={2.2} />
        </motion.div>

        <h2 className="font-display text-3xl font-bold gold-text text-center mb-1">
          {title}
        </h2>
        <p className="text-center text-xs text-ink-soft mb-6">{subtitle}</p>

        <div className="space-y-2 mb-5">
          {LOCALES.map((l, i) => {
            const info = LOCALE_INFO[l];
            const active = locale === l;
            return (
              <motion.button
                key={l}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                onClick={() => handlePick(l)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3 rounded-2xl border-2 transition-all",
                  active
                    ? "border-gold bg-gold/10 shadow-[0_0_20px_-4px_rgba(240,193,75,0.5)]"
                    : "border-white/10 hover:border-white/30 hover:bg-white/[0.03]",
                )}
              >
                <span className="text-4xl leading-none flex-shrink-0">{info.flag}</span>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-ink">{info.nativeName}</p>
                  <p className="text-[11px] text-ink-soft/70">{info.englishName}</p>
                </div>
                {active && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-gold flex items-center justify-center flex-shrink-0"
                  >
                    <Check className="w-3.5 h-3.5 text-[#1c1206]" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-gold-bright to-gold-deep text-[#1c1206] font-bold transition-all shadow-[0_10px_30px_-5px_rgba(240,193,75,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(240,193,75,0.7)] hover:scale-[1.02]"
        >
          {cta}
        </button>
      </motion.div>
    </motion.div>
  );
}
