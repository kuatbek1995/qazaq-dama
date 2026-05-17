"use client";

import { motion } from "framer-motion";
import { Check, Crown, Sparkles, X, Zap } from "lucide-react";

type Props = { onClose: () => void };

const FEATURES = [
  { icon: <Sparkles className="w-4 h-4" />, text: "Эксклюзивные темы досок: «Юрта», «Степь», «Тенгри»" },
  { icon: <Crown className="w-4 h-4" />, text: "Кастомные дизайны шашек (золотые орнаменты, лазуритовые)" },
  { icon: <Zap className="w-4 h-4" />, text: "Безлимитный AI-разбор + персональный план тренировок" },
  { icon: <Check className="w-4 h-4" />, text: "Турниры на 4-8 игроков и приватные комнаты" },
  { icon: <Check className="w-4 h-4" />, text: "Без рекламы навсегда" },
];

export function ProUpgradeModal({ onClose }: Props) {
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
        className="relative bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913] border-2 border-gold/40 rounded-3xl p-8 max-w-md w-full shadow-[0_30px_80px_-10px_rgba(240,193,75,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-ink-soft" />
        </button>

        <div className="text-center mb-6">
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-3 bg-gradient-to-br from-gold-bright via-gold to-gold-deep shadow-[0_0_40px_rgba(240,193,75,0.6)]"
          >
            <Crown className="w-8 h-8 text-[#1c1206]" fill="currentColor" fillOpacity={0.3} />
          </motion.div>
          <h2 className="font-display text-4xl font-bold gold-text mb-1">Qazaq Dama Pro</h2>
          <p className="text-ink-soft text-sm">Поддержи проект и получи всё</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-gold/15 to-gold-deep/5 border border-gold/30 p-5 mb-5">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-4xl font-bold gold-text">$2</span>
            <span className="text-sm text-ink-soft">/мес</span>
          </div>
          <div className="text-center text-xs text-gold uppercase tracking-widest">
            Early bird · первые 1000 пользователей
          </div>
        </div>

        <ul className="space-y-3 mb-6">
          {FEATURES.map((f, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="flex items-start gap-3 text-sm"
            >
              <span className="mt-0.5 w-6 h-6 rounded-full bg-gold/20 text-gold-bright flex items-center justify-center flex-shrink-0">
                {f.icon}
              </span>
              <span className="text-ink">{f.text}</span>
            </motion.li>
          ))}
        </ul>

        <button
          onClick={() => {
            alert(
              "Pro-подписка скоро откроется! Подписывайся на наши обновления — мы напишем тебе первым.",
            );
            onClose();
          }}
          className="w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-gold-bright to-gold-deep text-[#1c1206] font-bold flex items-center justify-center gap-2 hover:from-gold-bright hover:to-gold transition-all shadow-[0_10px_30px_-5px_rgba(240,193,75,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(240,193,75,0.7)] hover:scale-[1.02]"
        >
          <Crown className="w-4 h-4" />
          Получить Pro
        </button>

        <p className="text-center text-xs text-ink-soft/60 mt-4">
          В реальной версии тут будет Stripe Checkout
        </p>
      </motion.div>
    </motion.div>
  );
}
