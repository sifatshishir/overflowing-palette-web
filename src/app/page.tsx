'use client';

import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/hooks/useGame';
import { GameCanvas } from '@/components/GameCanvas';
import { ColorPalette } from '@/components/ColorPalette';

import confetti from 'canvas-confetti';

import { RulesModal } from '@/components/RulesModal';

export default function Home() {
  const { gameState, playMove, resetGame, setDifficulty, getHint, clearHint, config } = useGame();
  const [selectedColor, setSelectedColor] = useState<string>(config.colors[0]);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hintType, setHintType] = useState<'info' | 'error'>('info');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Ref to hold the active timeout
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ... (useEffect hooks same as before) ...
  // Ensure selectedColor is valid if config changes or initially
  useEffect(() => {
    if (gameState && !config.colors.includes(selectedColor)) {
      setSelectedColor(config.colors[0]);
    }
  }, [config.colors, gameState, selectedColor]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    }
  }, []);

  // Win Effect (Same as before)
  useEffect(() => {
    if (gameState && gameState.status === 'WON') {
      const duration = 3 * 1000;
      // ... (confetti logic)
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [gameState?.status]);

  if (!gameState) return <div className="flex h-screen items-center justify-center text-white">Loading Engine...</div>;

  const handlePaletteSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleGridClick = (x: number, y: number) => {
    playMove(x, y, selectedColor);
  };

  const showHintToast = (msg: string, type: 'info' | 'error' = 'info') => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    setHintMessage(msg);
    setHintType(type);

    hintTimeoutRef.current = setTimeout(() => {
      clearHint();
      setHintMessage(null);
      hintTimeoutRef.current = null;
    }, 4000);
  }

  const handleHint = () => {
    const hint = getHint();

    if (hint === 'DEAD_END') {
      showHintToast('No winning moves detected! Try restarting.', 'error');
      return;
    }

    if (hint && typeof hint === 'object') {
      // User must select manually
      const colorNames: { [key: string]: string } = {
        '#00D2FC': 'Cyan',
        '#FFD166': 'Yellow',
        '#FF3B30': 'Red',
        '#34C759': 'Green',
        '#AF52DE': 'Purple',
        '#FF9500': 'Orange',
      };
      const name = colorNames[hint.color] || 'this color';
      showHintToast(`Tip: Select ${name}!`, 'info');
    }
  };

  const isGameOver = gameState.status !== 'PLAYING';
  const message = gameState.status === 'WON' ? 'Level Complete!' : 'Out of Moves!';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-2 md:p-4 font-sans text-gray-100 overflow-x-hidden">
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      <div className="w-full max-w-4xl space-y-4 md:space-y-8">

        {/* Header & Level Select */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Overflowing Palette</h1>
            <p className="text-sm md:text-base text-gray-400 flex items-center justify-center md:justify-start gap-2">
              Target: Fill with <span className="inline-block w-5 h-5 rounded-full border border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: gameState.targetColor }}></span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm font-medium border border-gray-700"
            >
              📜 Rules
            </button>

            <div className="flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800 scale-90 md:scale-100">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${config.difficulty === level ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center min-w-[80px] md:min-w-[100px] bg-gray-800 p-3 rounded-xl border border-gray-700">
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-1">Moves</span>
            <span className={`text-2xl md:text-3xl font-mono font-bold ${gameState.movesLeft < 5 ? 'text-red-400' : 'text-white'}`}>
              {gameState.movesLeft}
            </span>
          </div>
        </div>

        {/* Hint Message Overlay */}
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${hintMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className={`backdrop-blur-md text-white px-6 py-3 rounded-full border shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center gap-3 ${hintType === 'error'
            ? 'bg-red-900/90 border-red-500/50 shadow-red-500/20'
            : 'bg-black/80 border-yellow-400/50 shadow-yellow-400/20'
            }`}>
            <span className="text-2xl">{hintType === 'error' ? '⚠️' : '💡'}</span>
            <span className="font-bold tracking-wide">{hintMessage}</span>
          </div>
        </div>

        {/* Game UI Container */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start justify-center">

          {/* Game Board */}
          <div className="w-full max-w-[500px] md:max-w-[600px] aspect-square mx-auto">
            <GameCanvas
              gameState={gameState}
              onCellClick={handleGridClick}
            />
          </div>

          {/* Controls */}
          <div className="w-full md:w-auto flex flex-col gap-6 min-w-[200px] pb-8 md:pb-0">
            {/* Palette */}
            <div className="bg-gray-900 p-4 md:p-6 rounded-2xl border border-gray-800 shadow-xl">
              <h3 className="text-xs md:text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider text-center">Palette Tool</h3>
              <ColorPalette
                colors={config.colors}
                onSelectColor={handlePaletteSelect}
                disabled={isGameOver}
                currentColor={selectedColor}
              />
            </div>

            {/* Hint Button */}
            {!isGameOver && (
              <button
                onClick={handleHint}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
              >
                💡 Show Hint
              </button>
            )}

            {/* Status Actions */}
            <div className="flex flex-col gap-4">
              {isGameOver ? (
                <div className="text-center animate-fade-in bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl ring-1 ring-white/10">
                  <h2 className={`text-2xl font-bold mb-4 ${gameState.status === 'WON' ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                  </h2>
                  <button
                    onClick={resetGame}
                    className="w-full px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-transformation active:scale-95 shadow-lg"
                  >
                    Play Again
                  </button>
                </div>
              ) : (
                <button
                  onClick={resetGame}
                  className="w-full px-6 py-3 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 font-medium rounded-xl transition-colors border border-gray-700"
                >
                  Restart Level
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
