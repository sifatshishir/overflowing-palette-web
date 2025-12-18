'use client';

import { useEffect, useRef } from 'react';
import { GameState } from '../game/types';
import { CanvasRenderer } from '../game/Renderer';

export function GameCanvas({ gameState, onCellClick }: { gameState: GameState; onCellClick: (x: number, y: number) => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);
    const requestRef = useRef<number>(0);

    // Handle Resize
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                const dpr = window.devicePixelRatio || 1;
                canvas.width = width * dpr;
                canvas.height = height * dpr;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                    rendererRef.current = new CanvasRenderer(ctx, width, height);
                    // Initial draw
                    if (gameState) {
                        rendererRef.current.updateTarget(gameState.grid);
                        rendererRef.current.setHint(gameState.activeHint);
                    }
                }
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    // Animation Loop
    useEffect(() => {
        const animate = () => {
            if (rendererRef.current) {
                const needsRedraw = rendererRef.current.animate();

                // If hint is active, we MUST redraw to show the pulse animation (since it depends on time)
                // We check internal state of renderer via a getter or just force it if we know we have a hint?
                // Since we don't expose renderer state easily, let's just use the prop access if possible?
                // Actually, usage of `requestAnimationFrame` usually implies constant drawing or "dirty" check.
                // Let's modify Renderer.animate to return true if hint is active? 
                // Or better: pass a "force" flag?

                // Cleaner: The renderer.animate() loop handles interpolation. 
                // We can add a method `hasActiveAnimation()` to renderer?
                // For now, if we want pulse, we need to draw every frame.

                // Let's assume if there is a hint passed to renderer, it wants to animate.
                // We can rely on renderer.animate() returning true if we update it to know about hints.
                // Go update Renderer.ts animate() to return true if activeHint is set.
            }
            requestRef.current = requestAnimationFrame(animate);
        };
        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // Sync State
    useEffect(() => {
        if (rendererRef.current && gameState) {
            rendererRef.current.updateTarget(gameState.grid, gameState.lastFlood);
            rendererRef.current.setHint(gameState.activeHint);
        }
    }, [gameState]);

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!gameState || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const size = gameState.grid.size;
        const width = rect.width;
        const height = rect.height;

        const cellW = width / size;
        const cellH = height / size;

        const gridX = Math.floor(x / cellW);
        const gridY = Math.floor(y / cellH);

        if (gridX >= 0 && gridX < size && gridY >= 0 && gridY < size) {
            onCellClick(gridX, gridY);
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full min-h-[300px] aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-gray-800 bg-gray-900">
            <canvas
                ref={canvasRef}
                onClick={handleClick}
                className="w-full h-full cursor-pointer touch-manipulation"
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}
