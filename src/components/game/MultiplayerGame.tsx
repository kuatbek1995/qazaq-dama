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
import type { RealtimeChannel } from "@supabase/supabase-js";

const TIMER_BUDGET_MS = 3 * 60 * 1000;

type PresenceRow = {
  user_id: string;
  joined_at: number;
};

export function MultiplayerGame({ matchId }: { matchId: string }) {
  const router = useRouter();
  const supabase = getSupabase();
  const configured = isSupabaseConfigured();

  const [myColor, setMyColor] = useState<Color | null>(null);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [state, setState] = useState<GameState>(() => initialState());
  const [selected, setSelected] = useState<Coord | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [timer, setTimer] = useState({ white: TIMER_BUDGET_MS, black: TIMER_BUDGET_MS });
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string>("");
  const joinedAtRef = useRef<number>(Date.now());
  const stateRef = useRef(state);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(`${window.location.origin}/m/${matchId}`);
    userIdRef.current = crypto.randomUUID();
    joinedAtRef.current = Date.now();
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
        const hasOpponent = players.length >= 2;
        setOpponentJoined(hasOpponent);

        // If we're white (host) and a second player just joined → push state
        if (meIndex === 0 && hasOpponent) {
          channel.send({
            type: "broadcast",
            event: "sync",
            payload: { state: stateRef.current, startedAt },
          });
        }
      })
      .on("broadcast", { event: "move" }, ({ payload }) => {
        const move = payload.move as Move;
        setState((s) => (s.winner ? s : applyMove(s, move)));
        setSelected(null);
      })
      .on("broadcast", { event: "sync" }, ({ payload }) => {
        if (payload.state) setState(payload.state as GameState);
        if (payload.startedAt) setStartedAt(payload.startedAt as number);
      })
      .on("broadcast", { event: "resign" }, ({ payload }) => {
        const loser = payload.color as Color;
        setState((s) => (s.winner ? s : { ...s, winner: loser === "white" ? "black" : "white" }));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userIdRef.current,
            joined_at: joinedAtRef.current,
          });
        }
      });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [supabase, matchId, startedAt]);

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
      setState((s) =>
        s.winner ? s : { ...s, winner: s.turn === "white" ? "black" : "white" },
      );
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
    if (!confirm("Сдаться? Соперник победит.")) return;
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
          <h2 className="font-display text-2xl font-bold mb-3 gold-text">Мультиплеер не настроен</h2>
          <p className="text-ink-soft mb-6 text-sm">
            Для онлайн-партий нужен Supabase Realtime. Админ должен задать
            <code className="block mt-2 text-xs font-mono text-gold">
              NEXT_PUBLIC_SUPABASE_URL
              <br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
          </p>
          <button
            onClick={backToMenu}
            className="px-5 py-2.5 rounded-xl bg-gold text-[#1c1206] text-sm font-semibold hover:bg-gold-bright"
          >
            В меню
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
          <h2 className="font-display text-3xl font-bold gold-text mb-2">Ждём соперника</h2>
          <p className="text-ink-soft text-sm mb-6">
            Скопируй ссылку и отправь другу — как только он откроет, начнётся партия.
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
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </div>
          <div className="text-xs text-ink-soft/60 mb-6">
            Ты играешь {myColor === "white" ? "золотыми (ходишь первым)" : myColor === "black" ? "синими" : "..."}.
          </div>
          <button
            onClick={backToMenu}
            className="flex items-center gap-2 mx-auto text-sm text-ink-soft hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Отменить
          </button>
        </motion.div>
      </div>
    );
  }

  const durationSec = Math.floor((Date.now() - startedAt) / 1000);
  const modeLabel = "Онлайн · мультиплеер";
  const topLabel = "Соперник";
  const bottomLabel = `Вы (${myColor === "white" ? "золотые" : "синие"})`;

  return (
    <div className="min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={backToMenu}
            className="flex items-center gap-2 text-sm text-ink-soft hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Покинуть
          </button>
          <button
            onClick={resign}
            disabled={!!state.winner}
            className="flex items-center gap-2 text-sm text-ink-soft hover:text-[var(--danger)] transition-colors disabled:opacity-40"
          >
            <Flag className="w-4 h-4" />
            Сдаться
          </button>
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
          />
        </div>
      </div>

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
      </AnimatePresence>
    </div>
  );
}
