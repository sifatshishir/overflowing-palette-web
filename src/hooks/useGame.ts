'use client';

import { useEffect, useRef, useState } from 'react';
import { Engine } from '../game/Engine';
import { GameState, GameConfig, Difficulty } from '../game/types';
import { SoundEngine } from '../utils/audio';

const GAME_CONFIG: GameConfig = {
    gridSize: 4,
    maxMoves: 10,
    difficulty: 'EASY',
    colors: [
        '#00D2FC', // Cyan
        '#FFD166', // Yellow
        '#FF3B30', // Red
        '#34C759', // Green
        '#AF52DE', // Purple
        '#FF9500', // Orange
    ],
};

export function useGame() {
    const engineRef = useRef<Engine | null>(null);
    const soundRef = useRef<SoundEngine | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        soundRef.current = new SoundEngine();
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

    const playMove = (x: number, y: number, color: string) => {
        soundRef.current?.playClick();

        if (engineRef.current) {
            const changed = engineRef.current.playMove(x, y, color);

            if (changed > 0) {
                // Play soothing ripple
                soundRef.current?.playRipple(changed);
            }
        }

        if (engineRef.current?.getState().status === 'WON') {
            soundRef.current?.playWin();
        }
    };

    const resetGame = () => {
        if (engineRef.current) {
            engineRef.current.reset();
        }
    }

    const setDifficulty = (level: 'EASY' | 'MEDIUM' | 'HARD') => {
        if (engineRef.current) {
            engineRef.current.reset(level);
        }
    }

    const getHint = () => {
        soundRef.current?.playHint();
        return engineRef.current?.getHint();
    }

    const clearHint = () => {
        engineRef.current?.clearHint();
    }

    return {
        gameState,
        playMove,
        resetGame,
        setDifficulty,
        getHint,
        clearHint,
        engine: engineRef.current,
        config: GAME_CONFIG
    };
}
