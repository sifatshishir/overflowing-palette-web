
export type Color = string; // Hex codes or CSS color names

export interface Vector2 {
    x: number;
    y: number;
}

export interface Cell {
    color: Color;
    owner: boolean; // Does this belong to the player's controlled region?
    id: string; // Unique ID for React keys if needed (x-y)
}

export interface GridState {
    cells: Cell[][];
    size: number;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface GameConfig {
    gridSize: number;
    colors: Color[];
    maxMoves: number;
    difficulty: Difficulty;
}

export type GameStatus = "PLAYING" | "WON" | "LOST";

export interface GameState {
    grid: GridState;
    movesLeft: number;
    status: GameStatus;
    currentTurn: number;
    targetColor: Color;
    activeHint: { x: number, y: number, color: Color } | null;
    lastFlood: { x: number, y: number, depth: number }[] | null;
}
