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

export function pickAIMove(state: GameState, difficulty: Difficulty): Move | null {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return null;

  if (difficulty === "easy") {
    const maxCaptures = Math.max(...moves.map((m) => m.captures.length));
    if (maxCaptures > 0 && Math.random() < 0.6) {
      const caps = moves.filter((m) => m.captures.length === maxCaptures);
      return caps[Math.floor(Math.random() * caps.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === "medium" ? 3 : 5;

  // Shuffle to break ties unpredictably
  const shuffled = [...moves].sort(() => Math.random() - 0.5);

  let bestMove = shuffled[0];
  let bestScore = state.turn === "white" ? -Infinity : Infinity;

  for (const m of shuffled) {
    const score = minimax(applyMove(state, m), depth - 1, -Infinity, Infinity);
    if (state.turn === "white") {
      if (score > bestScore) {
        bestScore = score;
        bestMove = m;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = m;
      }
    }
  }
  return bestMove;
}
