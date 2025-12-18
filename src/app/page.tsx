'use client';

import { useGame } from '@/hooks/useGame';
import { GameCanvas } from '@/components/GameCanvas';
import { ColorPalette } from '@/components/ColorPalette';

export default function Home() {
  const { gameState, playMove, resetGame, config } = useGame();

  if (!gameState) return <div className="flex h-screen items-center justify-center text-white">Loading Engine...</div>;

  const handleColorSelect = (color: string) => {
    playMove(color);
  };

  const isGameOver = gameState.status !== 'PLAYING';
  const message = gameState.status === 'WON' ? 'Level Complete!' : 'Out of Moves!';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-4 font-sans text-gray-100">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Color Flood</h1>
            <p className="text-sm text-gray-400">Fill the board with one color.</p>
          </div>
          <div className="flex flex-col items-center min-w-[80px] bg-gray-800 p-2 rounded-lg">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Moves</span>
            <span className={`text-2xl font-mono font-bold ${gameState.movesLeft < 5 ? 'text-red-400' : 'text-white'}`}>
              {gameState.movesLeft} / {config.maxMoves}
            </span>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center">
          <GameCanvas
            gameState={gameState}
            width={350}
            height={350}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <ColorPalette
            colors={config.colors}
            onSelectColor={handleColorSelect}
            disabled={isGameOver}
            currentColor={gameState.grid.cells[0][0].color}
          />

          {isGameOver && (
            <div className="text-center animate-fade-in">
              <h2 className={`text-2xl font-bold mb-2 ${gameState.status === 'WON' ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </h2>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!isGameOver && (
            <div className="text-center">
              <button onClick={resetGame} className="text-xs text-gray-500 hover:text-gray-300 underline">
                Restart Level
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
