"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { onMuteChange, sound, toggleMuteAndNotify } from "@/lib/sound";

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    sound.init();
    setMuted(sound.isMuted());
    return onMuteChange(setMuted);
  }, []);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => toggleMuteAndNotify()}
      aria-label={muted ? "Включить звук" : "Выключить звук"}
      title={muted ? "Включить звук" : "Выключить звук"}
      className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-ink-soft hover:text-ink transition-all"
    >
      {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
    </motion.button>
  );
}
