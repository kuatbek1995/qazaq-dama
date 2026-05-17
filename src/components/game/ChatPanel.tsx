"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  from: "me" | "opponent";
  text: string;
  sticker?: string;
  timestamp: number;
  fromName?: string;
};

type Props = {
  messages: ChatMessage[];
  onSend: (payload: { text?: string; sticker?: string }) => void;
  opponentName: string;
};

const STICKERS = ["👍", "👎", "🔥", "😂", "😱", "🤔", "👑", "❤️", "🎉", "😤", "🤝", "🙈"];

export function ChatPanel({ messages, onSend, opponentName }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [showStickers, setShowStickers] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lastSeenRef = useRef<number>(0);

  // Track unread when panel closed
  useEffect(() => {
    if (open) {
      setUnread(0);
      lastSeenRef.current = messages.length;
      return;
    }
    const newOpponentMsgs = messages
      .slice(lastSeenRef.current)
      .filter((m) => m.from === "opponent").length;
    if (newOpponentMsgs > 0) setUnread((u) => u + newOpponentMsgs);
    lastSeenRef.current = messages.length;
  }, [messages, open]);

  // Auto-scroll on new message
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  function send() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend({ text: trimmed.slice(0, 200) });
    setInput("");
  }

  function sendSticker(sticker: string) {
    onSend({ sticker });
    setShowStickers(false);
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-kz-blue to-kz-blue-deep shadow-[0_8px_24px_-4px_rgba(0,175,202,0.6)] flex items-center justify-center text-white hover:shadow-[0_10px_30px_-4px_rgba(0,175,202,0.8)] transition-shadow"
        aria-label="Открыть чат"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-[var(--danger)] text-white text-[10px] font-bold flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-24 right-6 z-40 w-[340px] max-w-[calc(100vw-3rem)] h-[460px] max-h-[calc(100vh-8rem)] bg-gradient-to-b from-[#0c1729] to-[#050913] border border-kz-blue/30 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-kz-blue" />
              <span className="font-display text-sm font-semibold">Чат с {opponentName}</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-ink-soft/50 text-xs gap-2">
                  <MessageCircle className="w-8 h-8 opacity-30" />
                  <div>Сообщений нет.</div>
                  <div>Поприветствуй соперника 👋</div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      msg.from === "me" ? "self-end ml-auto items-end" : "items-start",
                    )}
                  >
                    {msg.sticker ? (
                      <div className="text-4xl px-1">{msg.sticker}</div>
                    ) : (
                      <div
                        className={cn(
                          "px-3 py-2 rounded-2xl text-sm break-words",
                          msg.from === "me"
                            ? "bg-gradient-to-br from-gold to-gold-deep text-[#1c1206] rounded-br-sm"
                            : "bg-white/10 text-ink rounded-bl-sm",
                        )}
                      >
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {showStickers && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-3 py-2 border-t border-white/10 grid grid-cols-6 gap-1"
              >
                {STICKERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendSticker(s)}
                    className="text-2xl p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}

            <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={() => setShowStickers((s) => !s)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showStickers
                    ? "bg-gold/20 text-gold-bright"
                    : "text-ink-soft hover:bg-white/10 hover:text-ink",
                )}
                aria-label="Стикеры"
              >
                <Smile className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Сообщение…"
                maxLength={200}
                className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-ink text-sm placeholder-ink-soft/40 outline-none focus:border-kz-blue transition-colors"
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-kz-blue text-white hover:bg-kz-blue/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Отправить"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
