import { GridState, Cell } from './types';

export class CanvasRenderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    private currentColors: string[][] = [];
    private targetGrid: GridState | null = null;
    private activeHint: { x: number, y: number, color: string } | null = null;
    private animationSpeed = 0.1;

    // Animation state
    private cellDelays: number[][] = [];
    private startTimes: number[][] = [];

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    updateTarget(gridState: GridState, lastFlood: { x: number, y: number, depth: number }[] | null = null) {
        this.targetGrid = gridState;
        const size = gridState.size;

        // Initialize currentColors if empty
        if (this.currentColors.length === 0 || this.currentColors.length !== size) {
            this.currentColors = Array(gridState.size).fill(0).map((_, y) =>
                Array(gridState.size).fill(0).map((_, x) => gridState.cells[y][x].color)
            );
            // Reset state
            this.cellDelays = Array(size).fill(0).map(() => Array(size).fill(0));
            this.startTimes = Array(size).fill(0).map(() => Array(size).fill(0));
        }

        // Calculate wave delays based on BFS depth
        const now = Date.now();

        if (lastFlood) {
            // Apply delays strictly based on flood depth
            for (const cell of lastFlood) {
                // 100ms per depth step for distinct "flow"
                this.startTimes[cell.y][cell.x] = now + cell.depth * 100;
            }
        } else {
            // Instant update if no flood info (e.g. init)
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    // If color mismatch but no flood info, sync immediately? 
                    // Or maybe we missed a frame? Let's just set to now.
                    if (this.currentColors[y][x] !== gridState.cells[y][x].color) {
                        this.startTimes[y][x] = 0;
                    }
                }
            }
        }
    }

    setHint(hint: { x: number, y: number, color: string } | null) {
        this.activeHint = hint;
        // Force redraw to show/hide hint immediately
        this.draw();
    }

    animate(): boolean {
        let isAnimating = false;

        // Pulse animation requires constant redraw
        if (this.activeHint) {
            isAnimating = true;
            this.draw(); // Force draw for pulse
        }

        if (!this.targetGrid) return isAnimating;

        let needsInterpolation = false;
        const size = this.targetGrid.size;
        const now = Date.now();

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const target = this.targetGrid.cells[y][x].color;
                const current = this.currentColors[y][x];

                // Only animate if the start time has passed
                if (now >= this.startTimes[y][x]) {
                    if (target !== current) {
                        needsInterpolation = true;
                        this.currentColors[y][x] = this.lerpColor(current, target, this.animationSpeed);
                    }
                } else {
                    // If start time hasn't passed, and target is different, we are still waiting to animate
                    if (target !== current) {
                        needsInterpolation = true; // Keep animating until all cells are updated
                    }
                }
            }
        }

        if (needsInterpolation && !this.activeHint) {
            this.draw(); // Only draw here if not already drawn by hint logic
            isAnimating = true;
        }

        return isAnimating;
    }

    // Helper to interpolate colors (simple RGB lerp)
    private lerpColor(c1: string, c2: string, t: number): string {
        // If hex, parse. For MVP, if it's strictly the palette colors, we might need mapped RGB values.
        // Assuming hex for now (palette is hex).
        if (!c1.startsWith('#') || !c2.startsWith('#')) return c2; // Fallback if not hex

        const parse = (c: string) => {
            const r = parseInt(c.slice(1, 3), 16);
            const g = parseInt(c.slice(3, 5), 16);
            const b = parseInt(c.slice(5, 7), 16);
            return [r, g, b];
        };

        const [r1, g1, b1] = parse(c1);
        const [r2, g2, b2] = parse(c2);

        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        // Snap if close
        if (Math.abs(r - r2) < 2 && Math.abs(g - g2) < 2 && Math.abs(b - b2) < 2) return c2;

        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    draw(gridState?: GridState) {
        // We draw using internal this.currentColors and this.targetGrid structure
        const gridToRender = gridState || this.targetGrid;
        if (!gridToRender) return;

        const { ctx, width, height } = this;
        const size = gridToRender.size;
        const cellSize = width / size;

        ctx.clearRect(0, 0, width, height);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Use current animated color
                const color = this.currentColors[y]?.[x] || gridToRender.cells[y][x].color;
                const cell = gridToRender.cells[y][x];

                const isHint = this.activeHint && this.activeHint.x === x && this.activeHint.y === y;
                // We pass the animated color instead of cell.color
                this.drawCell(x, y, cellSize, cell, color, !!isHint);
            }
        }
    }

    private drawCell(x: number, y: number, size: number, cell: Cell, overrideColor?: string, isHint: boolean = false) {
        const { ctx } = this;
        const gap = size * 0.1;
        const drawSize = size - gap;
        const radius = drawSize * 0.2;

        const px = x * size + gap / 2;
        const py = y * size + gap / 2;

        // Base color
        ctx.fillStyle = overrideColor || cell.color;

        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(px, py, drawSize, drawSize, radius);
        } else {
            ctx.rect(px, py, drawSize, drawSize);
        }
        ctx.fill();

        // Gloss
        const gradient = ctx.createLinearGradient(px, py, px + drawSize, py + drawSize);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');

        ctx.fillStyle = gradient;
        ctx.fill();

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (cell.owner) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // HINT GLOW & ICON
        if (isHint) {
            // Pulsing effect
            const time = Date.now();
            const pulse = (Math.sin(time / 200) + 1) / 2; // 0 to 1 oscillating

            // Outer Glow
            ctx.shadowColor = 'rgba(255, 255, 0, 0.8)'; // Yellow glow
            ctx.shadowBlur = 20 + pulse * 10; // Breathing blur

            // Thick Border
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`;
            ctx.lineWidth = 4;
            ctx.stroke();

            // Inner Highlight fill
            ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + pulse * 0.2})`;
            ctx.fill();

            // Reset shadow
            ctx.shadowBlur = 0;

            // DRAW ICON (Star)
            const cx = px + drawSize / 2;
            const cy = py + drawSize / 2;
            const starSize = drawSize * 0.3;

            ctx.fillStyle = 'white';
            ctx.beginPath();
            // Draw a 4-point star
            for (let i = 0; i < 4; i++) {
                const angle = i * Math.PI / 2;
                // Outer
                ctx.lineTo(cx + Math.cos(angle) * starSize, cy + Math.sin(angle) * starSize);
                // Inner
                ctx.lineTo(cx + Math.cos(angle + Math.PI / 4) * (starSize * 0.4), cy + Math.sin(angle + Math.PI / 4) * (starSize * 0.4));
            }
            ctx.closePath();
            ctx.fill();
        }
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}
