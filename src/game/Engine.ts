import { Grid } from './Grid';
import { Color, GameConfig, GameState, GameStatus } from './types';

import { Solver } from './Solver';

export class Engine {
    private grid!: Grid;
    private config: GameConfig;
    private state!: GameState;
    private listeners: ((state: GameState) => void)[] = [];

    constructor(config: GameConfig) {
        this.config = config;
        this.initGame(config);
    }

    private initGame(config: GameConfig) {
        // Random Target
        const targetColor = config.colors[Math.floor(Math.random() * config.colors.length)];

        // Generate valid grid
        this.grid = new Grid(config.gridSize, targetColor, config.colors);

        // Calculate moves
        // For now, simple heuristic based on size for performance instant load
        // Easy: 4x4 -> ~6 moves?
        // Med: 8x8 -> ~15 moves?
        // Hard: 10x10 -> ~20 moves?

        let baseMoves = 0;
        if (config.difficulty === 'EASY') baseMoves = 6;
        else if (config.difficulty === 'MEDIUM') baseMoves = 14;
        else baseMoves = 22;

        // Modifiers
        let extra = 0;
        if (config.difficulty === 'EASY') extra = 3;
        else if (config.difficulty === 'MEDIUM') extra = 1;
        else extra = 0;

        this.state = {
            grid: this.grid.getState(),
            movesLeft: baseMoves + extra,
            status: 'PLAYING',
            currentTurn: 0,
            targetColor,
            activeHint: null,
            lastFlood: null,
        };
    }

    // Main action: Flood fill from a specific cell
    playMove(x: number, y: number, targetColor: Color): number {
        if (this.state.status !== 'PLAYING') return 0;

        // Clear hint on any move attempt
        this.state.activeHint = null;
        // lastFlood will be set below if valid move

        // Validation
        if (x < 0 || x >= this.config.gridSize || y < 0 || y >= this.config.gridSize) {
            this.notify(); // Notify to clear hint even if invalid move
            return 0;
        }

        const targetCell = this.grid.cells[y][x];
        const startColor = targetCell.color;

        // No-op if same color
        if (startColor === targetColor) {
            this.notify();
            return 0;
        }

        const { changedCount, changedCells } = this.grid.floodAt(x, y, targetColor);

        // Store flood data for animation
        this.state.lastFlood = changedCells;

        if (changedCount > 0) {
            this.state.movesLeft--;
            this.state.currentTurn++;
        }

        this.updateStatus();
        this.notify();
        return changedCount;
    }

    private updateStatus() {
        if (this.grid.isSolved(this.state.targetColor)) {
            this.state.status = 'WON';
        } else if (this.state.movesLeft <= 0) {
            this.state.status = 'LOST';
        }

        // Sync grid state
        this.state.grid = this.grid.getState();
    }

    subscribe(callback: (state: GameState) => void) {
        this.listeners.push(callback);
        callback(this.state); // Immediate update
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    private notify() {
        this.listeners.forEach(l => l(this.state));
    }

    getState() {
        return this.state;
    }

    reset(newDifficulty?: 'EASY' | 'MEDIUM' | 'HARD') {
        if (newDifficulty) {
            this.config.difficulty = newDifficulty;
            if (newDifficulty === 'EASY') this.config.gridSize = 4;
            if (newDifficulty === 'MEDIUM') this.config.gridSize = 8;
            if (newDifficulty === 'HARD') this.config.gridSize = 10;
        }
        this.initGame(this.config);
        this.notify();
    }

    getHint() {
        // For Easy/Medium, we skip the strict winnability check to avoid premature DEAD_END
        // messages. The greedy solver might be too pessimistic, and we want to allow the 
        // user to use hints freely given the extra moves provided in these modes.
        const shouldCheckWinnable = this.config.difficulty === 'HARD';

        if (shouldCheckWinnable) {
            const isWinnable = Solver.simulateGreedy(this.grid, this.state.movesLeft, this.state.targetColor, this.config.colors);
            if (!isWinnable) {
                return 'DEAD_END';
            }
        }

        // Use Solver to find a good move
        const move = Solver.getHint(this.grid, this.state.targetColor, this.config.colors);
        if (move) {
            this.state.activeHint = move;
            this.notify();
        }
        return move;
    }

    clearHint() {
        if (this.state.activeHint) {
            this.state.activeHint = null;
            this.notify();
        }
    }
}
