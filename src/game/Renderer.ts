import { GridState, Cell } from './types';

export class CanvasRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    draw(gridState: GridState) {
        const { ctx, width, height } = this;
        const size = gridState.size;
        const cellSize = width / size; // Assume square for now

        ctx.clearRect(0, 0, width, height);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cell = gridState.cells[y][x];
                this.drawCell(x, y, cellSize, cell);
            }
        }
    }

    private drawCell(x: number, y: number, size: number, cell: Cell) {
        const { ctx } = this;
        const px = x * size;
        const py = y * size;

        ctx.fillStyle = cell.color;
        ctx.fillRect(px, py, size, size);

        // Optional: Draw border or highlight for owned cells
        // if (cell.owner) {
        //   ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        //   ctx.lineWidth = 1;
        //   ctx.strokeRect(px, py, size, size);
        // }
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        // In React, the canvas element size changes, so we just update internal dimension tracking
        // The actual context scale might need handling if we used devicePixelRatio
    }
}
