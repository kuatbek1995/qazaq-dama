"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Crown, Loader2, Sparkles } from "lucide-react";
import { saveProStatus } from "@/lib/pro";
import { ThemePickerModal } from "@/components/ThemePickerModal";

type VerifyState = "loading" | "ok" | "failed";

export default function ProSuccessPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <ProSuccessInner />
    </Suspense>
  );
}

function LoadingShell() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913] p-6">
      <Loader2 className="w-10 h-10 text-gold-bright animate-spin" />
    </main>
  );
}

function ProSuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [verifyState, setVerifyState] = useState<VerifyState>(
    sessionId ? "loading" : "ok",
  );
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [showThemes, setShowThemes] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setVerifyState("ok");
      return;
    }
    fetch(`/api/checkout-verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.verified) {
          saveProStatus({
            email: data.email,
            sessionId: data.sessionId,
            since: new Date().toISOString(),
          });
          setVerifyState("ok");
        } else {
          setVerifyState("failed");
          setVerifyError(data.error || "Не удалось подтвердить оплату");
        }
      })
      .catch((e) => {
        setVerifyState("failed");
        setVerifyError(e instanceof Error ? e.message : "Сетевая ошибка");
      });
  }, [sessionId]);

  useEffect(() => {
    if (verifyState !== "ok") return;
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

    const t = setTimeout(() => setShowThemes(true), 1800);
    return () => clearTimeout(t);
  }, [verifyState]);

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

        {verifyState === "loading" && (
          <>
            <h1 className="font-display text-3xl font-bold gold-text mb-3">
              Подтверждаем оплату…
            </h1>
            <Loader2 className="w-8 h-8 text-gold-bright animate-spin mx-auto" />
          </>
        )}

        {verifyState === "failed" && (
          <>
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
            <h1 className="font-display text-2xl font-bold text-ink mb-2">
              Не удалось подтвердить оплату
            </h1>
            <p className="text-ink-soft text-sm mb-6">{verifyError}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-white/10 text-ink font-bold hover:bg-white/20 transition-all"
            >
              Вернуться к игре
            </Link>
          </>
        )}

        {verifyState === "ok" && (
          <>
            <h1 className="font-display text-4xl font-bold gold-text mb-3">
              Добро пожаловать в Pro!
            </h1>
            <p className="text-ink-soft mb-6">
              Спасибо за поддержку Qazaq Dama 🇰🇿
              <br />
              <span className="inline-flex items-center gap-1 text-gold mt-2">
                <Sparkles className="w-4 h-4" />
                Темы досок и Pro-фишки активированы
              </span>
            </p>

            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-gold-bright to-gold-deep text-[#1c1206] font-bold hover:scale-[1.02] transition-transform shadow-[0_10px_30px_-5px_rgba(240,193,75,0.5)]"
            >
              Перейти в игру →
            </Link>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {showThemes && (
          <ThemePickerModal isPro onClose={() => setShowThemes(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
