'use client';

import { useEffect, useRef } from 'react';
import { GameState } from '../game/types';
import { CanvasRenderer } from '../game/Renderer';

interface GameCanvasProps {
    gameState: GameState;
    width: number;
    height: number;
}

export function GameCanvas({ gameState, width, height }: GameCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<CanvasRenderer | null>(null);

    // Initialize renderer
    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                rendererRef.current = new CanvasRenderer(ctx, width, height);
            }
        }
    }, [width, height]);

    // Draw when state changes
    useEffect(() => {
        if (rendererRef.current && gameState) {
            // For animation, we might want a requestAnimationFrame loop in the renderer
            // checking an interpolation value.
            // But for mvp, immediate draw is fine.
            rendererRef.current.draw(gameState.grid);
        }
    }, [gameState, width, height]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="rounded-lg shadow-2xl border-4 border-gray-700 bg-gray-900"
            style={{ width, height }}
        />
    );
}
