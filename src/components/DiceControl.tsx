import React, { useState } from 'react';
import { Player } from '../core/types';

interface DiceControlProps {
  activePlayer: Player;
  isRolling: boolean;
  isMoving: boolean;
  lastRoll: number | null;
  onRoll: () => void;
}

const DICE_FACES: Record<number, string> = {
  1: '⚀',
  2: '⚁',
  3: '⚂',
  4: '⚃',
  5: '⚄',
  6: '⚅'
};

const COLOR_ACCENTS: Record<string, { bg: string; text: string; ring: string }> = {
  pink: { bg: 'bg-pink-500 hover:bg-pink-600', text: 'text-pink-600', ring: 'border-pink-300' },
  purple: { bg: 'bg-purple-600 hover:bg-purple-700', text: 'text-purple-600', ring: 'border-purple-300' },
  yellow: { bg: 'bg-amber-400 hover:bg-amber-500', text: 'text-amber-700', ring: 'border-amber-300' },
  cyan: { bg: 'bg-cyan-500 hover:bg-cyan-600', text: 'text-cyan-700', ring: 'border-cyan-300' }
};

export const DiceControl: React.FC<DiceControlProps> = ({
  activePlayer,
  isRolling,
  isMoving,
  lastRoll,
  onRoll
}) => {
  const [displayRoll, setDisplayRoll] = useState<number>(lastRoll ?? 1);
  const isDisabled = isRolling || isMoving;
  const accent = COLOR_ACCENTS[activePlayer.color] || COLOR_ACCENTS.pink;

  const handleClick = () => {
    if (isDisabled) return;

    // Efeito visual rápido de dado rodando
    let count = 0;
    const interval = setInterval(() => {
      setDisplayRoll(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        onRoll();
      }
    }, 60);
  };

  return (
    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border-2 border-pink-200">
      {/* Informações do Jogador da Vez */}
      <div className="flex flex-col text-right">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
          Vez de Jogar
        </span>
        <span className={`text-xs sm:text-sm font-black truncate max-w-[90px] ${accent.text}`}>
          {activePlayer.name}
        </span>
      </div>

      {/* Botão de Dado */}
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${accent.bg} text-white flex items-center justify-center font-black shadow-lg transition-transform active:scale-90 disabled:opacity-75 disabled:pointer-events-none select-none relative group`}
        title="Toque para jogar o dado!"
      >
        <span className={`text-4xl sm:text-5xl drop-shadow ${isRolling ? 'animate-spin' : ''}`}>
          {DICE_FACES[displayRoll] || '🎲'}
        </span>

        {/* Efeito de pulso para chamar a atenção da criança */}
        {!isDisabled && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default DiceControl;
