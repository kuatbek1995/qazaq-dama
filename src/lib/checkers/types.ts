export type Color = "white" | "black";

export type Piece = {
  id: string;
  color: Color;
  king: boolean;
};

export type Cell = Piece | null;

export type Board = Cell[][];

export type Coord = { r: number; c: number };

export type Move = {
  from: Coord;
  to: Coord;
  captures: Coord[];
  becomesKing: boolean;
  path?: Coord[];
};

export type GameState = {
  board: Board;
  turn: Color;
  winner: Color | "draw" | null;
  history: Move[];
};

export type Difficulty = "easy" | "medium" | "hard";

export type GameMode = "hotseat" | "ai" | "online";
