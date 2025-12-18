'use client';

import { useEffect, useRef, useState } from 'react';
import { Engine } from '../game/Engine';
import { GameState, GameConfig, Color } from '../game/types';

const GAME_CONFIG: GameConfig = {
    gridSize: 14,
    maxMoves: 25,
    colors: [
        '#EF476F', // Red/Pink
        '#FFD166', // Yellow
        '#06D6A0', // Green
        '#118AB2', // Blue
        '#073B4C', // Dark Blue
        '#9D4EDD', // Purple
    ],
};

export function useGame() {
    const engineRef = useRef<Engine | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        // Initialize engine only once
        const engine = new Engine(GAME_CONFIG);
        engineRef.current = engine;

        // Subscribe to state changes
        const unsubscribe = engine.subscribe((newState) => {
            setGameState({ ...newState }); // Spread to ensure React triggers re-render
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const playMove = (color: Color) => {
        if (engineRef.current) {
            engineRef.current.playMove(color);
        }
    };

    const resetGame = () => {
        if (engineRef.current) {
            engineRef.current.reset();
        }
    }

    return {
        gameState,
        playMove,
        resetGame,
        engine: engineRef.current,
        config: GAME_CONFIG
    };
}
