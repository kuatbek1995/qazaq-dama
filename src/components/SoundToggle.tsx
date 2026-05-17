"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { onMuteChange, sound, toggleMuteAndNotify } from "@/lib/sound";
import { useT } from "@/lib/i18n";

export function SoundToggle() {
  const t = useT();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    sound.init();
    setMuted(sound.isMuted());
    return onMuteChange(setMuted);
  }, []);

  const label = muted ? t("menu.sound.unmute") : t("menu.sound.mute");

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => toggleMuteAndNotify()}
      aria-label={label}
      title={label}
      className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-ink-soft hover:text-ink transition-all"
    >
      {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
    </motion.button>
  );
}
