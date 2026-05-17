"use client";

import { motion } from "framer-motion";
import { MapPin, User } from "lucide-react";
import { useState } from "react";
import { KZ_CITIES, type KzCity } from "@/lib/supabase";
import { saveIdentity, type Identity } from "@/lib/identity";

type Props = {
  initial?: Identity;
  onClose: () => void;
  onSave: (identity: Identity) => void;
  title?: string;
};

export function IdentityModal({ initial, onClose, onSave, title }: Props) {
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [city, setCity] = useState<KzCity>(initial?.city ?? "Алматы");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 20) return;
    const identity: Identity = { nickname: trimmed, city };
    const ok = saveIdentity(identity);
    if (!ok) {
      setError("Не удалось сохранить. Проверь, не выключен ли private mode в браузере.");
      return;
    }
    onSave(identity);
  }

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
        className="bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913] border border-gold/30 rounded-3xl p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-3xl font-bold gold-text mb-2">
          {title ?? "Кто ты, чемпион?"}
        </h2>
        <p className="text-ink-soft text-sm mb-6">
          Имя и город попадут в лидерборд. Можешь сменить в любой момент.
        </p>

        <label className="block mb-4">
          <span className="text-xs uppercase tracking-widest text-ink-soft mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Имя
          </span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            placeholder="Айдар"
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-ink placeholder-ink-soft/40 outline-none focus:border-gold transition-colors"
          />
        </label>

        <label className="block mb-6">
          <span className="text-xs uppercase tracking-widest text-ink-soft mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Город
          </span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value as KzCity)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-ink outline-none focus:border-gold transition-colors"
          >
            {KZ_CITIES.map((c) => (
              <option key={c} value={c} className="bg-[#0c1729]">
                {c}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Позже
          </button>
          <button
            onClick={submit}
            disabled={nickname.trim().length < 2}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-gold to-gold-deep text-[#1c1206] hover:from-gold-bright hover:to-gold transition-colors text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Сохранить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
