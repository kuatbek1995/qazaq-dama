"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Copy, Flag, Link2, Loader2 } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  applyMove,
  getMovesFrom,
  initialState,
} from "@/lib/checkers/engine";
import type { Color, Coord, GameState, Move } from "@/lib/checkers/types";
import { Board } from "./Board";
import { GameSidebar } from "./GameSidebar";
import { EndScreen } from "./EndScreen";
import { ChatPanel, type ChatMessage } from "./ChatPanel";
import { IdentityModal } from "@/components/IdentityModal";
import { SoundToggle } from "@/components/SoundToggle";
import { sound } from "@/lib/sound";
import { loadIdentity, type Identity } from "@/lib/identity";
import { isPro as loadIsPro } from "@/lib/pro";
import { useT } from "@/lib/i18n";
import type { RealtimeChannel } from "@supabase/supabase-js";

const TIMER_BUDGET_MS = 3 * 60 * 1000;

type PresenceRow = {
  user_id: string;
  joined_at: number;
};

export function MultiplayerGame({ matchId }: { matchId: string }) {
  const t = useT();
  const router = useRouter();
  const supabase = getSupabase();
  const configured = isSupabaseConfigured();

  const [myColor, setMyColor] = useState<Color | null>(null);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [state, setState] = useState<GameState>(() => initialState());
  const [selected, setSelected] = useState<Coord | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [timer, setTimer] = useState({ white: TIMER_BUDGET_MS, black: TIMER_BUDGET_MS });
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [myIdentity, setMyIdentity] = useState<Identity | null>(null);
  const [identityLoaded, setIdentityLoaded] = useState(false);
  const [opponentIdentity, setOpponentIdentity] = useState<Identity | null>(null);
  const [myIsPro, setMyIsPro] = useState(false);
  const [opponentIsPro, setOpponentIsPro] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string>("");
  const joinedAtRef = useRef<number>(Date.now());
  const stateRef = useRef(state);
  const startedAtRef = useRef<number>(startedAt);
  const lastTickRef = useRef<number>(Date.now());
  const myIdentityRef = useRef<Identity | null>(null);
  const myIsProRef = useRef<boolean>(false);
  const prevHistoryLenRef = useRef<number>(0);
  const winnerSoundPlayedRef = useRef<boolean>(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);

  useEffect(() => {
    myIdentityRef.current = myIdentity;
  }, [myIdentity]);

  // Load identity on mount + start game ambient
  useEffect(() => {
    setMyIdentity(loadIdentity());
    const pro = loadIsPro();
    setMyIsPro(pro);
    myIsProRef.current = pro;
    setIdentityLoaded(true);
    sound.init();
    sound.startGameAmbient();
    return () => sound.stopGameAmbient();
  }, []);

  // Move sound on every new move
  useEffect(() => {
    if (state.history.length > prevHistoryLenRef.current) {
      const lastMove = state.history[state.history.length - 1];
      if (lastMove?.captures?.length) sound.playCapture();
      else sound.playMove();
    }
    prevHistoryLenRef.current = state.history.length;
  }, [state.history.length, state.history]);

  // Victory / defeat sound
  useEffect(() => {
    if (!state.winner || !myColor) {
      winnerSoundPlayedRef.current = false;
      return;
    }
    if (winnerSoundPlayedRef.current) return;
    winnerSoundPlayedRef.current = true;
    if (state.winner === myColor) sound.playVictory();
    else sound.playDefeat();
  }, [state.winner, myColor]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(`${window.location.origin}/m/${matchId}`);
    // Persist user ID per-match so browser refresh keeps the same seat.
    const storageKey = `qd-match-uid:${matchId}`;
    const joinedKey = `qd-match-joined:${matchId}`;
    let uid = sessionStorage.getItem(storageKey);
    let joined = sessionStorage.getItem(joinedKey);
    if (!uid) {
      uid = crypto.randomUUID();
      sessionStorage.setItem(storageKey, uid);
    }
    if (!joined) {
      joined = String(Date.now());
      sessionStorage.setItem(joinedKey, joined);
    }
    userIdRef.current = uid;
    joinedAtRef.current = Number(joined);
  }, [matchId]);

  // Realtime channel
  useEffect(() => {
    if (!supabase || !userIdRef.current) return;

    const channel = supabase.channel(`match:${matchId}`, {
      config: {
        presence: { key: userIdRef.current },
        broadcast: { self: false, ack: false },
      },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const ps = channel.presenceState() as Record<string, PresenceRow[]>;
        const players = Object.values(ps).flat();
        if (players.length === 0) return;
        const sorted = [...players].sort((a, b) => a.joined_at - b.joined_at);
        const meIndex = sorted.findIndex((p) => p.user_id === userIdRef.current);
        if (meIndex === 0) setMyColor("white");
        else if (meIndex === 1) setMyColor("black");
        else if (meIndex >= 2) setIsSpectator(true);
        const hasOpponent = players.length >= 2;
        setOpponentJoined(hasOpponent);

        // If we're white (host) and a second player just joined → push state to everyone
        if (meIndex === 0 && hasOpponent) {
          channel.send({
            type: "broadcast",
            event: "sync",
            payload: { state: stateRef.current, startedAt: startedAtRef.current },
          });
        }
        // Re-broadcast our identity (in case opponent missed initial subscribe broadcast)
        if (hasOpponent && myIdentityRef.current) {
          channel.send({
            type: "broadcast",
            event: "identity",
            payload: { userId: userIdRef.current, identity: myIdentityRef.current, isPro: myIsProRef.current },
          });
        }
      })
      .on("broadcast", { event: "move" }, ({ payload }) => {
        try {
          const move = payload.move as Move;
          setState((s) => (s.winner ? s : applyMove(s, move)));
          setSelected(null);
        } catch {
          // ignore malformed move payload
        }
      })
      .on("broadcast", { event: "sync" }, ({ payload }) => {
        if (payload?.state) setState(payload.state as GameState);
        if (payload?.startedAt) setStartedAt(payload.startedAt as number);
      })
      .on("broadcast", { event: "resign" }, ({ payload }) => {
        const loser = payload.color as Color;
        setState((s) => (s.winner ? s : { ...s, winner: loser === "white" ? "black" : "white" }));
      })
      .on("broadcast", { event: "timeout" }, ({ payload }) => {
        const loser = payload.color as Color;
        setState((s) => (s.winner ? s : { ...s, winner: loser === "white" ? "black" : "white" }));
      })
      .on("broadcast", { event: "identity" }, ({ payload }) => {
        if (payload?.userId && payload.userId !== userIdRef.current && payload?.identity) {
          setOpponentIdentity(payload.identity as Identity);
          setOpponentIsPro(Boolean(payload.isPro));
        }
      })
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        if (payload?.userId && payload.userId !== userIdRef.current && payload?.message) {
          const m = payload.message as ChatMessage;
          setChatMessages((prev) => [
            ...prev,
            { ...m, from: "opponent" },
          ]);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userIdRef.current,
            joined_at: joinedAtRef.current,
          });
          // Broadcast our identity right after joining the channel.
          if (myIdentityRef.current) {
            channel.send({
              type: "broadcast",
              event: "identity",
              payload: { userId: userIdRef.current, identity: myIdentityRef.current, isPro: myIsProRef.current },
            });
          }
        }
      });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
    // Intentionally exclude startedAt — it's mirrored to startedAtRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, matchId]);

  // Timer
  useEffect(() => {
    if (state.winner || !opponentJoined) return;
    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setTimer((prev) => {
        const next = { ...prev };
        next[state.turn] = Math.max(0, prev[state.turn] - delta);
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [state.turn, state.winner, opponentJoined]);

  useEffect(() => {
    if (state.winner || !myColor) return;
    if (timer[state.turn] === 0) {
      const loser = state.turn;
      setState((s) =>
        s.winner ? s : { ...s, winner: loser === "white" ? "black" : "white" },
      );
      // Broadcast so opponent's clock-side learns about timeout too.
      channelRef.current?.send({
        type: "broadcast",
        event: "timeout",
        payload: { color: loser },
      });
    }
  }, [timer, state.turn, state.winner, myColor]);

  const possibleMoves = selected ? getMovesFrom(state, selected) : [];

  const handleSquareClick = useCallback(
    (r: number, c: number) => {
      if (state.winner || !myColor || !opponentJoined) return;
      if (state.turn !== myColor) return;
      const piece = state.board[r][c];
      if (selected) {
        const moves = getMovesFrom(state, selected);
        const move = moves.find((m) => m.to.r === r && m.to.c === c);
        if (move) {
          setState((s) => applyMove(s, move));
          setSelected(null);
          channelRef.current?.send({
            type: "broadcast",
            event: "move",
            payload: { move },
          });
          return;
        }
      }
      if (piece && piece.color === state.turn) {
        const moves = getMovesFrom(state, { r, c });
        setSelected(moves.length > 0 ? { r, c } : null);
        return;
      }
      setSelected(null);
    },
    [state, selected, myColor, opponentJoined],
  );

  function sendChat(payload: { text?: string; sticker?: string }) {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      from: "me",
      text: payload.text ?? "",
      sticker: payload.sticker,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, msg]);
    channelRef.current?.send({
      type: "broadcast",
      event: "chat",
      payload: { userId: userIdRef.current, message: msg },
    });
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  function backToMenu() {
    router.push("/");
  }
  function resign() {
    if (!myColor) return;
    if (!confirm(t("mp.surrender") + "?")) return;
    setState((s) => (s.winner ? s : { ...s, winner: myColor === "white" ? "black" : "white" }));
    channelRef.current?.send({
      type: "broadcast",
      event: "resign",
      payload: { color: myColor },
    });
  }
  function playAgain() {
    const fresh = initialState();
    setState(fresh);
    setSelected(null);
    setTimer({ white: TIMER_BUDGET_MS, black: TIMER_BUDGET_MS });
    setStartedAt(Date.now());
    channelRef.current?.send({
      type: "broadcast",
      event: "sync",
      payload: { state: fresh, startedAt: Date.now() },
    });
  }

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center p-8 rounded-2xl border border-white/10 bg-white/[0.02]">
          <h2 className="font-display text-2xl font-bold mb-3 gold-text">{t("mp.notConfigured.title")}</h2>
          <p className="text-ink-soft mb-6 text-sm">
            {t("mp.notConfigured.body")}
            <code className="block mt-2 text-xs font-mono text-gold">
              NEXT_PUBLIC_SUPABASE_URL
              <br />
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
            </code>
          </p>
          <button
            onClick={backToMenu}
            className="px-5 py-2.5 rounded-xl bg-gold text-[#1c1206] text-sm font-semibold hover:bg-gold-bright"
          >
            {t("mp.leave")}
          </button>
        </div>
      </div>
    );
  }

  // Spectator (3rd+ party in this match)
  if (isSpectator) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 ornament-bg">
        <div className="max-w-md text-center p-8 rounded-3xl border border-white/10 bg-white/[0.02]">
          <h2 className="font-display text-2xl font-bold mb-3 gold-text">{t("mp.alreadyFull.title")}</h2>
          <p className="text-ink-soft mb-6 text-sm">
            {t("mp.alreadyFull.body")}
          </p>
          <button
            onClick={backToMenu}
            className="px-5 py-2.5 rounded-xl bg-gold text-[#1c1206] text-sm font-semibold hover:bg-gold-bright"
          >
            {t("mp.leave")}
          </button>
        </div>
      </div>
    );
  }

  // Waiting for opponent
  if (!opponentJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 ornament-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center p-8 rounded-3xl border border-gold/30 bg-gradient-to-br from-[#1a2540] via-[#0c1729] to-[#050913]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Loader2 className="w-10 h-10 text-gold-bright" />
          </motion.div>
          <h2 className="font-display text-3xl font-bold gold-text mb-2">{t("mp.waiting.title")}</h2>
          <p className="text-ink-soft text-sm mb-6">
            {t("mp.waiting.body")}
          </p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/10 mb-4">
            <Link2 className="w-4 h-4 text-gold flex-shrink-0" />
            <input
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-ink-soft outline-none truncate"
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={copyLink}
              className="px-3 py-1.5 rounded-lg bg-gold text-[#1c1206] text-xs font-semibold flex items-center gap-1.5 hover:bg-gold-bright transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t("mp.copied") : t("mp.copy")}
            </button>
          </div>
          <div className="text-xs text-ink-soft/60 mb-6">
            {myColor === "white" ? t("mp.youPlay.gold") : myColor === "black" ? t("mp.youPlay.blue") : t("mp.youPlay.unknown")}
          </div>
          <button
            onClick={backToMenu}
            className="flex items-center gap-2 mx-auto text-sm text-ink-soft hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("mp.cancel")}
          </button>
        </motion.div>
      </div>
    );
  }

  const durationSec = Math.floor((Date.now() - startedAt) / 1000);
  const modeLabel = t("mp.mode");
  const colorLabel = myColor === "white" ? t("mp.color.gold") : t("mp.color.blue");
  const topLabel = opponentIdentity ? opponentIdentity.nickname : t("game.opponent.generic");
  const bottomLabel = myIdentity
    ? `${myIdentity.nickname} · ${myIdentity.city} (${colorLabel})`
    : t("mp.you.withColor", { color: colorLabel });

  return (
    <div className="min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={backToMenu}
            className="flex items-center gap-2 text-sm text-ink-soft hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("mp.leave")}
          </button>
          <div className="flex items-center gap-3">
            <SoundToggle />
            <button
              onClick={resign}
              disabled={!!state.winner}
              className="flex items-center gap-2 text-sm text-ink-soft hover:text-[var(--danger)] transition-colors disabled:opacity-40"
            >
              <Flag className="w-4 h-4" />
              {t("mp.surrender")}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="flex-1 max-w-[640px] w-full mx-auto">
            <Board
              state={state}
              selected={selected}
              possibleMoves={possibleMoves}
              onSquareClick={handleSquareClick}
              perspective={myColor ?? "white"}
              disabled={state.turn !== myColor || !!state.winner}
            />
          </div>
          <GameSidebar
            state={state}
            modeLabel={modeLabel}
            topLabel={topLabel}
            bottomLabel={bottomLabel}
            yourColor={myColor ?? "white"}
            timer={timer}
            topIsPro={opponentIsPro}
            bottomIsPro={myIsPro}
          />
        </div>
      </div>

      {opponentJoined && !state.winner && (
        <ChatPanel
          messages={chatMessages}
          onSend={sendChat}
          opponentName={opponentIdentity?.nickname ?? t("mp.opponentFallback")}
        />
      )}

      <AnimatePresence>
        {state.winner && myColor && (
          <EndScreen
            winner={state.winner}
            yourColor={myColor}
            onPlayAgain={playAgain}
            onMenu={backToMenu}
            durationSec={durationSec}
            moves={state.history.length}
            history={state.history}
            opponent="multiplayer"
          />
        )}
        {identityLoaded && !myIdentity && (
          <IdentityModal
            required
            hideCityField
            onClose={() => {}}
            onSave={(id) => {
              setMyIdentity(id);
              // Broadcast new identity to opponent immediately
              channelRef.current?.send({
                type: "broadcast",
                event: "identity",
                payload: { userId: userIdRef.current, identity: id },
              });
            }}
            title={t("mp.identity.title")}
            description={t("mp.identity.desc")}
            submitLabel={t("mp.identity.submit")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
