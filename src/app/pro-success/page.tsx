"use client";

import { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";

export default function ProSuccessPage() {
  useEffect(() => {
    const fire = (ratio: number, opts: confetti.Options) => {
      confetti({
        particleCount: Math.floor(200 * ratio),
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#F0C14B", "#E8A923", "#FFE082", "#1c1206"],
        ...opts,
      });
    };
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913] p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="max-w-md w-full text-center bg-white/5 border-2 border-gold/40 rounded-3xl p-10 backdrop-blur-md shadow-[0_30px_80px_-10px_rgba(240,193,75,0.5)]"
      >
        <motion.div
          initial={{ rotate: -20, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex w-20 h-20 rounded-2xl items-center justify-center mb-5 bg-gradient-to-br from-gold-bright via-gold to-gold-deep shadow-[0_0_50px_rgba(240,193,75,0.7)]"
        >
          <Crown className="w-10 h-10 text-[#1c1206]" fill="currentColor" fillOpacity={0.3} />
        </motion.div>

        <h1 className="font-display text-4xl font-bold gold-text mb-3">
          Добро пожаловать в Pro!
        </h1>
        <p className="text-ink-soft mb-6">
          Спасибо за поддержку Qazaq Dama 🇰🇿
          <br />
          <span className="inline-flex items-center gap-1 text-gold mt-2">
            <Sparkles className="w-4 h-4" />
            Все Pro-фишки активированы
          </span>
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-gold-bright to-gold-deep text-[#1c1206] font-bold hover:scale-[1.02] transition-transform shadow-[0_10px_30px_-5px_rgba(240,193,75,0.5)]"
        >
          Вернуться к игре
        </Link>
      </motion.div>
    </main>
  );
}
