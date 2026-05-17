import type { Board, Cell, Color, Coord, GameState, Move, Piece } from "./types";

export const BOARD_SIZE = 8;

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

const inBounds = (r: number, c: number) =>
  r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

export function isDarkSquare(r: number, c: number): boolean {
  return (r + c) % 2 === 1;
}

export function initialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null as Cell),
  );
  let nextId = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isDarkSquare(r, c))
        board[r][c] = { id: `b${nextId++}`, color: "black", king: false };
    }
  }
  nextId = 0;
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isDarkSquare(r, c))
        board[r][c] = { id: `w${nextId++}`, color: "white", king: false };
    }
  }
  return board;
}

export function initialState(): GameState {
  return {
    board: initialBoard(),
    turn: "white",
    winner: null,
    history: [],
  };
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function isPromoted(piece: Piece, r: number): boolean {
  return (piece.color === "white" && r === 0) || (piece.color === "black" && r === BOARD_SIZE - 1);
}

function captureSequencesFor(
  startBoard: Board,
  startR: number,
  startC: number,
): Move[] {
  const startPiece = startBoard[startR][startC];
  if (!startPiece) return [];
  const sequences: Move[] = [];

  const explore = (
    curR: number,
    curC: number,
    captured: Coord[],
    boardCopy: Board,
    path: Coord[],
    isKingNow: boolean,
  ) => {
    let extended = false;

    for (const [dr, dc] of DIRS) {
      if (isKingNow) {
        let nr = curR + dr;
        let nc = curC + dc;
        while (inBounds(nr, nc) && boardCopy[nr][nc] === null) {
          nr += dr;
          nc += dc;
        }
        if (!inBounds(nr, nc)) continue;
        const target = boardCopy[nr][nc];
        if (!target || target.color === startPiece.color) continue;
        if (captured.some((cap) => cap.r === nr && cap.c === nc)) continue;
        let lr = nr + dr;
        let lc = nc + dc;
        while (inBounds(lr, lc) && boardCopy[lr][lc] === null) {
          const nextBoard = cloneBoard(boardCopy);
          nextBoard[curR][curC] = null;
          nextBoard[lr][lc] = { ...startPiece, king: true };
          extended = true;
          explore(
            lr,
            lc,
            [...captured, { r: nr, c: nc }],
            nextBoard,
            [...path, { r: lr, c: lc }],
            true,
          );
          lr += dr;
          lc += dc;
        }
      } else {
        const nr = curR + dr;
        const nc = curC + dc;
        const lr = curR + 2 * dr;
        const lc = curC + 2 * dc;
        if (!inBounds(lr, lc)) continue;
        const target = boardCopy[nr][nc];
        if (!target || target.color === startPiece.color) continue;
        if (boardCopy[lr][lc] !== null) continue;
        if (captured.some((cap) => cap.r === nr && cap.c === nc)) continue;
        const nextBoard = cloneBoard(boardCopy);
        nextBoard[curR][curC] = null;
        const promoted = isPromoted(startPiece, lr);
        nextBoard[lr][lc] = promoted ? { ...startPiece, king: true } : startPiece;
        extended = true;
        explore(
          lr,
          lc,
          [...captured, { r: nr, c: nc }],
          nextBoard,
          [...path, { r: lr, c: lc }],
          promoted,
        );
      }
    }

    if (!extended && captured.length > 0) {
      const becomesKing =
        !startPiece.king &&
        ((startPiece.color === "white" && curR === 0) ||
          (startPiece.color === "black" && curR === BOARD_SIZE - 1));
      sequences.push({
        from: { r: startR, c: startC },
        to: { r: curR, c: curC },
        captures: captured,
        becomesKing,
        path,
      });
    }
  };

  explore(startR, startC, [], startBoard, [{ r: startR, c: startC }], startPiece.king);
  return sequences;
}

function quietMovesFor(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: Move[] = [];

  if (piece.king) {
    for (const [dr, dc] of DIRS) {
      let nr = r + dr;
      let nc = c + dc;
      while (inBounds(nr, nc) && board[nr][nc] === null) {
        moves.push({
          from: { r, c },
          to: { r: nr, c: nc },
          captures: [],
          becomesKing: false,
          path: [
            { r, c },
            { r: nr, c: nc },
          ],
        });
        nr += dr;
        nc += dc;
      }
    }
  } else {
    const dr = piece.color === "white" ? -1 : 1;
    for (const dc of [-1, 1]) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc] === null) {
        const becomesKing =
          (piece.color === "white" && nr === 0) || (piece.color === "black" && nr === BOARD_SIZE - 1);
        moves.push({
          from: { r, c },
          to: { r: nr, c: nc },
          captures: [],
          becomesKing,
          path: [
            { r, c },
            { r: nr, c: nc },
          ],
        });
      }
    }
  }

  return moves;
}

export function getLegalMoves(state: GameState): Move[] {
  if (state.winner) return [];
  const { board, turn } = state;
  const captures: Move[] = [];
  const quiet: Move[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== turn) continue;
      const caps = captureSequencesFor(board, r, c);
      if (caps.length > 0) captures.push(...caps);
      else quiet.push(...quietMovesFor(board, r, c));
    }
  }

  return captures.length > 0 ? captures : quiet;
}

export function getMovesFrom(state: GameState, from: Coord): Move[] {
  return getLegalMoves(state).filter(
    (m) => m.from.r === from.r && m.from.c === from.c,
  );
}

export function applyMove(state: GameState, move: Move): GameState {
  const newBoard = cloneBoard(state.board);
  const piece = newBoard[move.from.r][move.from.c]!;
  newBoard[move.from.r][move.from.c] = null;
  for (const cap of move.captures) {
    newBoard[cap.r][cap.c] = null;
  }
  newBoard[move.to.r][move.to.c] = move.becomesKing
    ? { ...piece, king: true }
    : piece;

  const nextTurn: Color = state.turn === "white" ? "black" : "white";
  const next: GameState = {
    board: newBoard,
    turn: nextTurn,
    winner: null,
    history: [...state.history, move],
  };

  const opponentMoves = getLegalMoves(next);
  if (opponentMoves.length === 0) {
    next.winner = state.turn;
  }

  return next;
}

export function countPieces(board: Board): { white: number; black: number; whiteKings: number; blackKings: number } {
  let white = 0, black = 0, whiteKings = 0, blackKings = 0;
  for (const row of board) {
    for (const cell of row) {
      if (!cell) continue;
      if (cell.color === "white") {
        white++;
        if (cell.king) whiteKings++;
      } else {
        black++;
        if (cell.king) blackKings++;
      }
    }
  }
  return { white, black, whiteKings, blackKings };
}
