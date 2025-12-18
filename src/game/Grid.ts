import { Cell, Color, GridState, Vector2 } from './types';

export class Grid {
    size: number;
    cells: Cell[][];

    constructor(size: number, initialColor: Color, palette: Color[]) {
        this.size = size;
        this.cells = this.initializeGrid(size, initialColor, palette);
    }

    private initializeGrid(size: number, initialColor: Color, palette: Color[]): Cell[][] {
        const cells: Cell[][] = [];
        for (let y = 0; y < size; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < size; x++) {
                // Start with random colors, but top-left is owned
                const isOrigin = x === 0 && y === 0;
                const color = isOrigin ? initialColor : palette[Math.floor(Math.random() * palette.length)];

                row.push({
                    color,
                    owner: isOrigin,
                    id: `${x}-${y}`,
                });
            }
            cells.push(row);
        }
        return cells;
    }

    // Returns the new grid state after a flood
    flood(targetColor: Color): { cells: Cell[][], changedCount: number } {
        // Deep copy to avoid mutation of previous state (if we want immutability)
        // For performance on large grids, we might mutate, but for React it's safer to copy
        // Let's do a structured clone or simple map-copy for this scale.
        const newCells = this.cells.map(row => row.map(cell => ({ ...cell })));

        // 1. Identify all currently owned cells
        // 2. Change their color to targetColor
        // 3. Check neighbors of all owned cells. If neighbor matches targetColor, it becomes owned.
        // Repeat 3 until no new cells are added.

        // Better approach:
        // Change all 'owner' cells to targetColor.
        // Then run a BFS/DFS from (0,0) (or all owners) to find new connected neighbors of targetColor.

        let changed = false;
        let changedCount = 0;

        // Step 1: Update existing owners
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (newCells[y][x].owner) {
                    if (newCells[y][x].color !== targetColor) {
                        newCells[y][x].color = targetColor;
                        changed = true;
                    }
                }
            }
        }

        if (!changed) return { cells: newCells, changedCount: 0 }; // No move made if color was same

        // Step 2: Expand ownership
        // We can just iterate until stable or use a queue.
        // Queue is better. Initialize queue with all owned cells.
        const queue: Vector2[] = [];
        const visited = new Set<string>();

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (newCells[y][x].owner) {
                    queue.push({ x, y });
                    visited.add(`${x}-${y}`);
                }
            }
        }

        const directions = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];

        while (queue.length > 0) {
            const { x, y } = queue.shift()!;

            for (const dir of directions) {
                const nx = x + dir.x;
                const ny = y + dir.y;

                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                    const neighbor = newCells[ny][nx];
                    const key = `${nx}-${ny}`;

                    if (!visited.has(key)) {
                        if (neighbor.owner) {
                            // Should be already in queue or processed?
                            // If logic is correct, all owners started in queue.
                        } else if (neighbor.color === targetColor) {
                            // Capture this cell
                            neighbor.owner = true;
                            changedCount++;
                            queue.push({ x: nx, y: ny });
                            visited.add(key);
                        }
                    }
                }
            }
        }

        this.cells = newCells; // Update internal state
        return { cells: newCells, changedCount };
    }

    isSolved(): boolean {
        const firstColor = this.cells[0][0].color;
        for (const row of this.cells) {
            for (const cell of row) {
                if (!cell.owner || cell.color !== firstColor) return false;
            }
        }
        return true;
    }

    getState(): GridState {
        return { cells: this.cells, size: this.size };
    }
}
