'use client';

import { Color } from '../game/types';

interface ColorPaletteProps {
    colors: Color[];
    onSelectColor: (color: Color) => void;
    disabled: boolean;
    currentColor: Color | undefined;
}

export function ColorPalette({ colors, onSelectColor, disabled, currentColor }: ColorPaletteProps) {
    return (
        <div className="flex gap-2 justify-center p-4 bg-gray-800/50 rounded-xl backdrop-blur-sm shadow-lg">
            {colors.map((color) => (
                <button
                    key={color}
                    onClick={() => onSelectColor(color)}
                    disabled={disabled || color === currentColor}
                    className={`
            w-12 h-12 rounded-full transition-all duration-200 transform hover:scale-110 active:scale-95
            focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
            ${color === currentColor ? 'ring-4 ring-white ring-opacity-100 scale-105 cursor-default' : 'cursor-pointer'}
            ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''}
          `}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                />
            ))}
        </div>
    );
}
