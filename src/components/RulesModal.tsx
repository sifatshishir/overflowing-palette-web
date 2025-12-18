import React from 'react';

interface RulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>📜</span> How to Play
                </h2>

                <div className="space-y-4 text-gray-300">
                    <section>
                        <h3 className="text-white font-semibold mb-2">Goal</h3>
                        <p className="text-sm leading-relaxed">
                            Fill the entire board with the <span className="text-yellow-400">Target Color</span> before you run out of moves.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-white font-semibold mb-2">Mechanics</h3>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-1 text-gray-400">
                            <li>Click a tile to flood-fill it and its connected neighbors with a new color.</li>
                            <li>Or use the <strong>Palette</strong> to change your selected brush color.</li>
                            <li>Plan ahead! Colors ripple out from where you click.</li>
                        </ul>
                    </section>

                    <section className="bg-gray-800 p-3 rounded-lg border border-gray-700 mt-4">
                        <h3 className="text-white font-semibold mb-1 text-xs uppercase tracking-wider">Strategy Tip</h3>
                        <p className="text-xs text-gray-400">
                            Try to merge small color blobs into larger ones. Unifying the board is key to winning efficiently!
                        </p>
                    </section>
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
}
