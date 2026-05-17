"use client";

import { motion } from "framer-motion";
import { Bot, Users, Link2, Trophy, Crown, Palette, Sparkles, Zap, Cpu, MapPin, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Difficulty } from "@/lib/checkers/types";
import { cn } from "@/lib/utils";
import { loadIdentity, type Identity } from "@/lib/identity";
import { applyTheme, loadProStatus, loadTheme, type ProStatus } from "@/lib/pro";
import { LOCALE_INFO, useLocale, useT } from "@/lib/i18n";
import { IdentityModal } from "@/components/IdentityModal";
import { ProUpgradeModal } from "@/components/ProUpgradeModal";
import { ThemePickerModal } from "@/components/ThemePickerModal";
import { LanguagePickerModal } from "@/components/LanguagePickerModal";
import { SoundToggle } from "@/components/SoundToggle";
import { sound } from "@/lib/sound";

type Props = {
  onStartHotseat: () => void;
  onStartAI: (difficulty: Difficulty) => void;
  onCreateMultiplayer: () => void;
  onOpenLeaderboard: () => void;
  hasSavedGame: boolean;
  onContinue?: () => void;
};

export function Menu({
  onStartHotseat,
  onStartAI,
  onCreateMultiplayer,
  onOpenLeaderboard,
  hasSavedGame,
  onContinue,
}: Props) {
  const t = useT();
  const { locale, hasPicked, ready: localeReady } = useLocale();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [pro, setPro] = useState<ProStatus | null>(null);
  const [showIdentity, setShowIdentity] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const langWasForced = useRef(false);

  useEffect(() => {
    setIdentity(loadIdentity());
    setPro(loadProStatus());
    applyTheme(loadTheme());
    sound.init();
    sound.startMenuAmbient();
    return () => sound.stopMenuAmbient();
  }, []);

  useEffect(() => {
    if (localeReady && !hasPicked) {
      langWasForced.current = true;
      setShowLang(true);
    }
  }, [localeReady, hasPicked]);

  const handleLangClose = () => {
    setShowLang(false);
    // First-time visit: chain into identity prompt if user hasn't named yet
    if (langWasForced.current && !loadIdentity()) {
      setShowIdentity(true);
    }
    langWasForced.current = false;
  };

  const isPro = pro !== null;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 ornament-bg relative">
      {/* Top-right: lang + identity + Pro + sound */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <SoundToggle />
        <button
          onClick={() => setShowLang(true)}
          aria-label="Change language"
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:border-gold/40 hover:bg-white/10 transition-all text-base leading-none"
          title={LOCALE_INFO[locale].nativeName}
        >
          <span>{LOCALE_INFO[locale].flag}</span>
        </button>
        <button
          onClick={() => setShowIdentity(true)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border transition-all flex items-center gap-1.5 hover:bg-white/10",
            isPro
              ? "border-gold/50 text-ink hover:border-gold"
              : "border-white/10 text-ink-soft hover:border-gold/40 hover:text-ink",
          )}
        >
          {isPro && <Crown className="w-3 h-3 text-gold-bright" fill="currentColor" fillOpacity={0.3} />}
          {identity ? (
            <>
              {!isPro && <User className="w-3 h-3" />}
              <span>{identity.nickname}</span>
              <span className="text-ink-soft/60">·</span>
              <MapPin className="w-3 h-3" />
              <span>{identity.city}</span>
            </>
          ) : (
            <>
              {!isPro && <User className="w-3 h-3" />}
              {t("menu.identity.name")}
            </>
          )}
        </button>
        {isPro ? (
          <button
            onClick={() => setShowThemes(true)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-gold-bright to-gold text-[#1c1206] hover:from-gold hover:to-gold-deep transition-all flex items-center gap-1.5 shadow-[0_4px_14px_-2px_rgba(240,193,75,0.5)]"
          >
            <Palette className="w-3 h-3" />
            {t("menu.pro.themes")}
          </button>
        ) : (
          <button
            onClick={() => setShowPro(true)}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-gold-bright to-gold text-[#1c1206] hover:from-gold hover:to-gold-deep transition-all flex items-center gap-1.5 shadow-[0_4px_14px_-2px_rgba(240,193,75,0.5)]"
          >
            <Crown className="w-3 h-3" />
            {t("menu.pro.upgrade")}
          </button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 max-w-2xl"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-bright to-gold-deep flex items-center justify-center shadow-[0_0_30px_rgba(240,193,75,0.5)]"
          >
            <Crown className="w-7 h-7 text-[#5c3c0c]" fill="currentColor" fillOpacity={0.3} strokeWidth={2.5} />
          </motion.div>
          <h1 className="font-display text-6xl md:text-7xl font-bold gold-text leading-none">
            Qazaq Dama
          </h1>
        </div>
        <p className="text-lg md:text-xl text-ink-soft mb-2 font-display italic">
          {t("menu.subtitle")}
        </p>
        <p className="text-sm text-ink-soft/70">{t("menu.subline")}</p>
      </motion.div>

      {hasSavedGame && onContinue && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onContinue}
          className="mb-8 px-6 py-3 rounded-full bg-gradient-to-r from-gold-bright to-gold text-[#1c1206] text-sm font-semibold flex items-center gap-2 shadow-[0_10px_30px_-8px_rgba(240,193,75,0.6)] hover:scale-105 transition-transform"
        >
          <Sparkles className="w-4 h-4" />
          {t("menu.continueSaved")}
        </motion.button>
      )}

      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl"
      >
        <ModeCard
          icon={<Users className="w-6 h-6" />}
          title={t("menu.hotseat.title")}
          desc={t("menu.hotseat.desc")}
          accent="silver"
          onClick={onStartHotseat}
        />
        <ModeCard
          icon={<Link2 className="w-6 h-6" />}
          title={t("menu.online.title")}
          desc={t("menu.online.desc")}
          accent="blue"
          onClick={onCreateMultiplayer}
          badge={t("menu.online.badge")}
        />
        <DifficultyCard onStart={onStartAI} />
        <ModeCard
          icon={<Trophy className="w-6 h-6" />}
          title={t("menu.leaderboard.title")}
          desc={t("menu.leaderboard.desc")}
          accent="gold"
          onClick={onOpenLeaderboard}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 text-xs text-ink-soft/50 text-center"
      >
        {t("menu.footer")}
      </motion.div>

      <AnimatePresence>
        {showIdentity && (
          <IdentityModal
            initial={identity ?? undefined}
            onClose={() => setShowIdentity(false)}
            onSave={(id) => {
              setIdentity(id);
              setShowIdentity(false);
            }}
          />
        )}
        {showPro && <ProUpgradeModal onClose={() => setShowPro(false)} />}
        {showThemes && (
          <ThemePickerModal isPro={isPro} onClose={() => setShowThemes(false)} />
        )}
        {showLang && (
          <LanguagePickerModal
            forced={!hasPicked}
            onClose={handleLangClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  accent,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: "gold" | "blue" | "silver";
  onClick: () => void;
  badge?: string;
}) {
  const accentClass = {
    gold: "from-gold/20 to-gold-deep/5 border-gold/30 hover:border-gold/60 hover:shadow-[0_0_30px_-8px_rgba(240,193,75,0.5)]",
    blue: "from-kz-blue/20 to-kz-blue/5 border-kz-blue/30 hover:border-kz-blue/60 hover:shadow-[0_0_30px_-8px_rgba(0,175,202,0.5)]",
    silver: "from-white/10 to-white/[0.02] border-white/20 hover:border-white/40 hover:shadow-[0_0_30px_-8px_rgba(255,255,255,0.2)]",
  }[accent];

  const iconClass = {
    gold: "bg-gold/20 text-gold-bright",
    blue: "bg-kz-blue/20 text-kz-blue",
    silver: "bg-white/10 text-ink",
  }[accent];

  return (
    <motion.button
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "text-left p-6 rounded-2xl bg-gradient-to-br border transition-all",
        accentClass,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconClass)}>
          {icon}
        </div>
        {badge && (
          <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-kz-blue/20 text-kz-blue font-semibold">
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-display text-xl font-semibold text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-soft/80">{desc}</p>
    </motion.button>
  );
}

function DifficultyCard({ onStart }: { onStart: (d: Difficulty) => void }) {
  const t = useT();
  const levels: { d: Difficulty; label: string; sub: string; icon: React.ReactNode }[] = [
    { d: "easy", label: t("menu.ai.easy"), sub: t("menu.ai.easy.sub"), icon: <Sparkles className="w-3.5 h-3.5" /> },
    { d: "medium", label: t("menu.ai.medium"), sub: t("menu.ai.medium.sub"), icon: <Zap className="w-3.5 h-3.5" /> },
    { d: "hard", label: t("menu.ai.hard"), sub: t("menu.ai.hard.sub"), icon: <Cpu className="w-3.5 h-3.5" /> },
  ];
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="text-left p-6 rounded-2xl bg-gradient-to-br from-gold/15 to-gold-deep/5 border border-gold/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-gold/20 text-gold-bright flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-gold/20 text-gold font-semibold">
          {t("menu.ai.badge")}
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink mb-1">{t("menu.ai.title")}</h3>
      <p className="text-sm text-ink-soft/80 mb-4">{t("menu.ai.desc")}</p>
      <div className="flex flex-col gap-2">
        {levels.map((l) => (
          <motion.button
            key={l.d}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(l.d)}
            className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.03] hover:bg-gold/10 border border-white/5 hover:border-gold/40 transition-all group"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <span className="text-gold-bright">{l.icon}</span>
              {l.label}
            </span>
            <span className="text-xs text-ink-soft/60 group-hover:text-ink-soft">{l.sub}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
