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

    // Flood fill starting from a specific coordinate
    floodAt(startX: number, startY: number, targetColor: string): { changedCount: number, changedCells: { x: number, y: number, depth: number }[] } {
        const startNode = this.cells[startY][startX];
        const startColor = startNode.color;

        if (startColor === targetColor) return { changedCount: 0, changedCells: [] };

        const queue: { x: number, y: number, depth: number }[] = [{ x: startX, y: startY, depth: 0 }];
        const visited = new Set<string>();
        const changedCells: { x: number, y: number, depth: number }[] = [];

        visited.add(`${startX},${startY}`);

        while (queue.length > 0) {
            const { x, y, depth } = queue.shift()!;
            const cell = this.cells[y][x];

            // Change color *conceptually* (Engine does it for real via returned data, or we do it here?)
            // The method logic implies mutating state.
            cell.color = targetColor;
            cell.owner = true; // Mark as owned if not already

            changedCells.push({ x, y, depth });

            // Neighbors
            const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (const [dx, dy] of dirs) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                    const key = `${nx},${ny}`;
                    if (!visited.has(key)) {
                        const neighbor = this.cells[ny][nx];
                        if (neighbor.color === startColor) {
                            visited.add(key);
                            queue.push({ x: nx, y: ny, depth: depth + 1 });
                        }
                    }
                }
            }
        }

        return { changedCount: changedCells.length, changedCells };
    }

    isSolved(targetColor: Color): boolean {
        for (const row of this.cells) {
            for (const cell of row) {
                if (cell.color !== targetColor) return false;
            }
        }
        return true;
    }

    getState(): GridState {
        return { cells: this.cells, size: this.size };
    }
}
