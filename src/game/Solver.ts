import { Grid } from './Grid';
import { Color, Cell, GridState } from './types';

export class Solver {
    static getHint(grid: Grid, targetColor: Color, colors: Color[]): { x: number, y: number, color: Color } | null {
        // Greedy Strategy:
        // Find the move that increases the "Target Component" size the most.
        // OR, the move that merges the largest neighbor component.

        // 1. Identify the Main Component (connected to user's starting point? 
        // With "Click Anywhere", the user might have multiple scattered components.
        // But the winning condition is "All Single Color".
        // Strategy: We want to unify the grid.

        // Simpler heuristic for "Click Anywhere":
        // Find the color that is most abundant adjacent to CURRENTLY active largest color blobs?
        // Actually, we can just Brute Force 1-ply search since grid is small (10x10).
        // Try clicking every cell (or representative of every region) with every valid color? 
        // No, you click a cell to change THAT cell's region.
        // So we iterate over all owned regions.

        // Let's assume the user is building ONE main component (usually the strategy).
        // Find the largest connected component of a single color.

        return this.findBestMove(grid, targetColor, colors);
    }

    private static findBestMove(grid: Grid, targetColor: Color, palette: Color[]) {
        // Deep copy grid to simulate
        // For 10x10, we can afford some simulation.

        // Optimization: We only care about changing the color of an existing component adjacent to other components.
        // But in this game, "Click Any Tile" means you change a component's color.

        const state = grid.getState();
        const clusters = this.getClusters(state);

        // Best move = the one that results in the largest merged cluster matching targetColor eventually.
        // Or simply reduce the number of clusters?

        let bestMove = null;
        let maxReduction = -1;

        // Try flooding each cluster to each neighbor's color
        for (const cluster of clusters) {
            // Options: Change this cluster to match a neighbor's color
            const neighborColors = new Set<Color>();

            // Find neighbors
            for (const cell of cluster.cells) {
                const n = this.getNeighbors(grid, cell.x, cell.y);
                n.forEach(nc => {
                    if (nc.color !== cluster.color) neighborColors.add(nc.color);
                });
            }

            for (const color of Array.from(neighborColors)) {
                // Simulate: If I change 'cluster' to 'color', how much does size increase?
                // It merges with all neighbors of 'color'.

                let mergedSize = cluster.cells.length;
                for (const other of clusters) {
                    if (other === cluster) continue;
                    if (other.color === color && this.areClustersAdjacent(cluster, other, grid)) {
                        mergedSize += other.cells.length;
                    }
                }

                if (mergedSize > maxReduction) {
                    maxReduction = mergedSize;
                    bestMove = { x: cluster.cells[0].x, y: cluster.cells[0].y, color };
                }
            }
        }

        // If no obvious merge, pick target color if possible, or random
        if (!bestMove && clusters.length > 0) {
            return { x: clusters[0].cells[0].x, y: clusters[0].cells[0].y, color: targetColor };
        }

        return bestMove;
    }

    private static getClusters(grid: GridState): { color: Color, cells: { x: number, y: number }[] }[] {
        const visited = new Set<string>();
        const clusters = [];
        const size = grid.size;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (visited.has(`${x}-${y}`)) continue;

                const color = grid.cells[y][x].color;
                const clusterCells = [];
                const queue = [{ x, y }];
                visited.add(`${x}-${y}`);

                while (queue.length) {
                    const c = queue.shift()!;
                    clusterCells.push(c);

                    const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
                    for (const d of dirs) {
                        const nx = c.x + d.x, ny = c.y + d.y;
                        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                            if (!visited.has(`${nx}-${ny}`) && grid.cells[ny][nx].color === color) {
                                visited.add(`${nx}-${ny}`);
                                queue.push({ x: nx, y: ny });
                            }
                        }
                    }
                }
                clusters.push({ color, cells: clusterCells });
            }
        }
        return clusters;
    }

    private static getNeighbors(grid: Grid, x: number, y: number) {
        const size = grid.size;
        const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
        const neighbors = [];
        for (const d of dirs) {
            const nx = x + d.x, ny = y + d.y;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                neighbors.push(grid.cells[ny][nx]);
            }
        }
        return neighbors;
    }

    private static areClustersAdjacent(c1: { cells: { x: number, y: number }[] }, c2: { cells: { x: number, y: number }[] }, grid: Grid) {
        // Expensive check, optimize for 10x10 is fine.
        const c2Map = new Set(c2.cells.map(c => `${c.x}-${c.y}`));
        const size = grid.size;

        for (const cell of c1.cells) {
            const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
            for (const d of dirs) {
                const nx = cell.x + d.x, ny = cell.y + d.y;
                if (c2Map.has(`${nx}-${ny}`)) return true;
            }
        }
        return false;
    }
    // Simulate the game forward to see if it's winnable with current moves
    static simulateGreedy(initialGrid: Grid, maxMoves: number, targetColor: Color, colors: Color[]): boolean {
        // Clone the grid state (using a simplified Grid wrapper would be faster, but strict clone is safe)
        // Since Grid class doesn't have a clone method, we recreate it manually or use state?
        // Let's modify Grid to take a state in constructor or just manipulate cells?
        // Actually, Solver uses Grid methods. 
        // Let's create a temporary Grid instance from state.

        const state = initialGrid.getState();
        // Fast clone:
        const simGrid = new Grid(state.size, state.cells[0][0].color, colors);
        // Copy cells
        for (let y = 0; y < state.size; y++) {
            for (let x = 0; x < state.size; x++) {
                simGrid.cells[y][x] = { ...state.cells[y][x] };
            }
        }

        let moves = 0;

        // Run greedy loop
        while (moves < maxMoves) {
            if (simGrid.isSolved(targetColor)) return true;

            const bestMove = this.findBestMove(simGrid, targetColor, colors);
            if (!bestMove) break; // No beneficial move found

            // Execute move
            // We assume start is always 0,0 for now since main component usually anchors there 
            // OR findBestMove returns a coordinate. The engine usually floods from there.
            // But wait, the user can click ANYWHERE. 
            // However, findBestMove returns the optimal flood coordinate.
            // We just need to apply it.

            // To apply, we need to know the 'old color' at that coord.
            // floodAt handles logic.
            const changed = simGrid.floodAt(bestMove.x, bestMove.y, bestMove.color).changedCount;
            if (changed === 0) break; // Should not happen with valid bestMove

            moves++;
        }

        return simGrid.isSolved(targetColor);
    }
}
