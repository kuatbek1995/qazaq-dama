import { applyMove, getLegalMoves } from "./engine";
import type { Difficulty, GameState, Move } from "./types";

function evaluate(state: GameState): number {
  if (state.winner === "white") return 10_000;
  if (state.winner === "black") return -10_000;

  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (!p) continue;
      const value = p.king ? 3 : 1;
      // Positional bonus: men get bonus for advancing
      const advance = p.king ? 0 : p.color === "white" ? (7 - r) * 0.05 : r * 0.05;
      // Center control bonus
      const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c);
      const center = (7 - centerDist) * 0.02;
      const total = value + advance + center;
      score += p.color === "white" ? total : -total;
    }
  }
  return score;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
): number {
  if (depth === 0 || state.winner) return evaluate(state);
  const moves = getLegalMoves(state);
  if (moves.length === 0) {
    return state.turn === "white" ? -10_000 : 10_000;
  }
  if (state.turn === "white") {
    let max = -Infinity;
    for (const m of moves) {
      const v = minimax(applyMove(state, m), depth - 1, alpha, beta);
      max = Math.max(max, v);
      alpha = Math.max(alpha, v);
      if (beta <= alpha) break;
    }
    return max;
  } else {
    let min = Infinity;
    for (const m of moves) {
      const v = minimax(applyMove(state, m), depth - 1, alpha, beta);
      min = Math.min(min, v);
      beta = Math.min(beta, v);
      if (beta <= alpha) break;
    }
    return min;
  }
}

// Pick from a pool of moves with slight weighting toward the better ones.
// Avoids the "always pick the strict #1" determinism that makes the AI feel scripted.
function weightedPick<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it.item;
  }
  return items[items.length - 1].item;
}

export function pickAIMove(state: GameState, difficulty: Difficulty): Move | null {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return null;

  if (difficulty === "easy") {
    const maxCaptures = Math.max(...moves.map((m) => m.captures.length));
    if (maxCaptures > 0 && Math.random() < 0.55) {
      const caps = moves.filter((m) => m.captures.length === maxCaptures);
      return caps[Math.floor(Math.random() * caps.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === "medium" ? 3 : 5;
  // How much worse than the best move is still acceptable in the random pool.
  // Wider for medium (more variety, more mistakes), narrower for hard (still strong).
  const epsilon = difficulty === "medium" ? 0.6 : 0.18;
  // Tiny noise applied to each leaf score to break exact ties differently every game.
  const noiseScale = difficulty === "medium" ? 0.05 : 0.02;

  const isMax = state.turn === "white";

  const scored = moves.map((m) => {
    const raw = minimax(applyMove(state, m), depth - 1, -Infinity, Infinity);
    const noisy = raw + (Math.random() - 0.5) * noiseScale;
    return { move: m, score: noisy };
  });

  // Sort best-first (max player descending; min player ascending).
  scored.sort((a, b) => (isMax ? b.score - a.score : a.score - b.score));
  const bestScore = scored[0].score;

  // Pool = moves within epsilon of the best.
  const pool = scored.filter((s) =>
    isMax ? s.score >= bestScore - epsilon : s.score <= bestScore + epsilon,
  );

  // Weight by closeness to the best. A move equal to the best gets weight 1.0;
  // a move that is `epsilon` worse gets close to 0.0. Keeps strong play
  // dominant while still allowing variety.
  const weighted = pool.map((s) => ({
    item: s.move,
    weight: 1 - Math.abs(s.score - bestScore) / (epsilon + 0.0001),
  }));

  return weightedPick(weighted);
}
