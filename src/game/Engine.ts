import { Grid } from './Grid';
import { Color, GameConfig, GameState, GameStatus } from './types';

export class Engine {
    private grid: Grid;
    private config: GameConfig;
    private state: GameState;
    private listeners: ((state: GameState) => void)[] = [];

    constructor(config: GameConfig) {
        this.config = config;
        // Initialize Grid
        const startColor = config.colors[0]; // Simplified start
        this.grid = new Grid(config.gridSize, startColor, config.colors);

        this.state = {
            grid: this.grid.getState(),
            movesLeft: config.maxMoves,
            status: 'PLAYING',
            currentTurn: 0,
        };
    }

    // Main action
    playMove(color: Color) {
        if (this.state.status !== 'PLAYING') return;

        const { changedCount } = this.grid.flood(color);

        if (changedCount > 0 || this.state.grid.cells[0][0].color !== color) {
            // Only count move if it actually changes something or tries to? 
            // Usually in Flood It, swapping to same color is invalid or no-op. 
            // If changedCount > 0, valid move.
            this.state.movesLeft--;
            this.state.currentTurn++;
        }

        this.updateStatus();
        this.notify();
    }

    private updateStatus() {
        if (this.grid.isSolved()) {
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

    reset() {
        // Re-init grid
        const startColor = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
        this.grid = new Grid(this.config.gridSize, startColor, this.config.colors);
        this.state = {
            grid: this.grid.getState(),
            movesLeft: this.config.maxMoves,
            status: 'PLAYING',
            currentTurn: 0,
        };
        this.notify();
    }
}
