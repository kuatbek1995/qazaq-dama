"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Flag } from "lucide-react";
import {
  applyMove,
  getLegalMoves,
  getMovesFrom,
  initialState,
} from "@/lib/checkers/engine";
import { pickAIMove } from "@/lib/checkers/ai";
import type {
  Color,
  Coord,
  Difficulty,
  GameMode,
  GameState,
  Move,
} from "@/lib/checkers/types";
import { Board } from "./Board";
import { GameSidebar } from "./GameSidebar";
import { EndScreen } from "./EndScreen";
import { Menu } from "./Menu";

type Screen = "menu" | "game" | "leaderboard";

type SavedGame = {
  state: GameState;
  mode: GameMode;
  difficulty?: Difficulty;
  yourColor: Color;
  startedAt: number;
  timer: { white: number; black: number };
};

const STORAGE_KEY = "qazaq-dama:saved-v1";
const TIMER_BUDGET_MS = 3 * 60 * 1000; // 3 minute blitz

export function CheckersGame() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<GameMode>("hotseat");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [yourColor, setYourColor] = useState<Color>("white");
  const [state, setState] = useState<GameState>(() => initialState());
  const [selected, setSelected] = useState<Coord | null>(null);
  const [thinking, setThinking] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [timer, setTimer] = useState({
    white: TIMER_BUDGET_MS,
    black: TIMER_BUDGET_MS,
  });
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);

  const lastTickRef = useRef<number>(Date.now());

  // Load saved game on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedGame;
        if (parsed && parsed.state && !parsed.state.winner) {
          setSavedGame(parsed);
        }
      }
    } catch {}
  }, []);

  // Persist current game
  useEffect(() => {
    if (screen !== "game") return;
    if (state.winner) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const data: SavedGame = {
      state,
      mode,
      difficulty: mode === "ai" ? difficulty : undefined,
      yourColor,
      startedAt,
      timer,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [state, mode, difficulty, yourColor, startedAt, timer, screen]);

  // Timer tick
  useEffect(() => {
    if (screen !== "game" || state.winner) return;
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
  }, [screen, state.turn, state.winner]);

  // Timeout winner check
  useEffect(() => {
    if (screen !== "game" || state.winner) return;
    if (timer[state.turn] === 0) {
      setState((s) =>
        s.winner ? s : { ...s, winner: s.turn === "white" ? "black" : "white" },
      );
    }
  }, [timer, state.turn, state.winner, screen]);

  // AI move
  useEffect(() => {
    if (screen !== "game" || mode !== "ai" || state.winner) return;
    if (state.turn === yourColor) return;
    setThinking(true);
    let cancelled = false;
    const startTime = Date.now();
    const minDelay = difficulty === "easy" ? 350 : difficulty === "medium" ? 500 : 700;
    const t1 = setTimeout(() => {
      if (cancelled) return;
      const aiMove = pickAIMove(state, difficulty);
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, minDelay - elapsed);
      const t2 = setTimeout(() => {
        if (cancelled) return;
        if (aiMove) {
          setState((s) => (s.winner ? s : applyMove(s, aiMove)));
        }
        setThinking(false);
      }, remainingDelay);
      // chain cleanup via outer closure
      (t1 as unknown as { inner?: ReturnType<typeof setTimeout> }).inner = t2;
    }, 50);
    return () => {
      cancelled = true;
      clearTimeout(t1);
      const inner = (t1 as unknown as { inner?: ReturnType<typeof setTimeout> }).inner;
      if (inner) clearTimeout(inner);
      setThinking(false);
    };
  }, [state, screen, mode, yourColor, difficulty]);

  const possibleMoves = selected ? getMovesFrom(state, selected) : [];

  const handleSquareClick = useCallback(
    (r: number, c: number) => {
      if (state.winner) return;
      if (mode === "ai" && state.turn !== yourColor) return;

      const piece = state.board[r][c];

      // Try to make a move
      if (selected) {
        const moves = getMovesFrom(state, selected);
        const move = moves.find((m) => m.to.r === r && m.to.c === c);
        if (move) {
          setState((s) => applyMove(s, move));
          setSelected(null);
          return;
        }
      }

      // Select piece if it's current player's
      if (piece && piece.color === state.turn) {
        const moves = getMovesFrom(state, { r, c });
        if (moves.length > 0) {
          setSelected({ r, c });
        } else {
          setSelected(null);
        }
        return;
      }

      setSelected(null);
    },
    [state, selected, mode, yourColor],
  );

  function startHotseat() {
    setMode("hotseat");
    setYourColor("white");
    setState(initialState());
    setSelected(null);
    setStartedAt(Date.now());
    setTimer({ white: TIMER_BUDGET_MS, black: TIMER_BUDGET_MS });
    setScreen("game");
    setSavedGame(null);
    localStorage.removeItem(STORAGE_KEY);
  }
  function startAI(d: Difficulty) {
    setMode("ai");
    setDifficulty(d);
    setYourColor("white");
    setState(initialState());
    setSelected(null);
    setStartedAt(Date.now());
    setTimer({ white: TIMER_BUDGET_MS, black: TIMER_BUDGET_MS });
    setScreen("game");
    setSavedGame(null);
    localStorage.removeItem(STORAGE_KEY);
  }
  function startMultiplayer() {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10);
    router.push(`/m/${id}`);
  }
  function openLeaderboard() {
    router.push("/leaderboard");
  }
  function continueGame() {
    if (!savedGame) return;
    setMode(savedGame.mode);
    if (savedGame.difficulty) setDifficulty(savedGame.difficulty);
    setYourColor(savedGame.yourColor);
    setState(savedGame.state);
    setSelected(null);
    setStartedAt(savedGame.startedAt);
    setTimer(savedGame.timer);
    setScreen("game");
  }
  function backToMenu() {
    setScreen("menu");
    setSelected(null);
  }
  function playAgain() {
    setState(initialState());
    setSelected(null);
    setStartedAt(Date.now());
    setTimer({ white: TIMER_BUDGET_MS, black: TIMER_BUDGET_MS });
  }
  function resign() {
    if (!confirm("Сдаться? Соперник победит.")) return;
    setState((s) => ({ ...s, winner: s.turn === "white" ? "black" : "white" }));
  }

  if (screen === "menu") {
    return (
      <Menu
        onStartHotseat={startHotseat}
        onStartAI={startAI}
        onCreateMultiplayer={startMultiplayer}
        onOpenLeaderboard={openLeaderboard}
        hasSavedGame={!!savedGame}
        onContinue={continueGame}
      />
    );
  }

  // Game screen
  const modeLabel =
    mode === "ai"
      ? `Против ИИ · ${difficulty === "easy" ? "Лёгкий" : difficulty === "medium" ? "Средний" : "Сложный"}`
      : mode === "hotseat"
      ? "С другом — за одним экраном"
      : "Онлайн";

  const topLabel =
    mode === "ai"
      ? "ИИ-соперник"
      : mode === "hotseat"
      ? `Игрок ${yourColor === "white" ? "2" : "1"} (синие)`
      : "Соперник";
  const bottomLabel =
    mode === "ai"
      ? "Вы"
      : mode === "hotseat"
      ? `Игрок ${yourColor === "white" ? "1" : "2"} (золотые)`
      : "Вы";

  const durationSec = Math.floor((Date.now() - startedAt) / 1000);

  return (
    <div className="min-h-screen px-4 py-6 md:py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={backToMenu}
            className="flex items-center gap-2 text-sm text-ink-soft hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            В меню
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
              perspective={mode === "hotseat" ? "white" : yourColor}
              disabled={(mode === "ai" && state.turn !== yourColor) || thinking || !!state.winner}
            />
          </div>
          <GameSidebar
            state={state}
            modeLabel={modeLabel}
            topLabel={topLabel}
            bottomLabel={bottomLabel}
            yourColor={yourColor}
            thinking={thinking}
            timer={timer}
          />
        </div>
      </div>

      <AnimatePresence>
        {state.winner && (
          <EndScreen
            winner={state.winner}
            yourColor={yourColor}
            onPlayAgain={playAgain}
            onMenu={backToMenu}
            durationSec={durationSec}
            moves={state.history.length}
            history={state.history}
            opponent={
              mode === "ai"
                ? (`ai-${difficulty}` as const)
                : mode === "hotseat"
                ? "hotseat"
                : "multiplayer"
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
