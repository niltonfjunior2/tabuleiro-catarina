import React from 'react';
import { Player, PlayerColor, TileOffset } from '../core/types';

interface PlayerTokenProps {
  player: Player;
  isActive: boolean;
  xPercent: number;
  yPercent: number;
  offset?: TileOffset;
}

const COLOR_STYLES: Record<PlayerColor, { bg: string; border: string; ring: string; icon: string }> = {
  pink: {
    bg: 'bg-pink-500',
    border: 'border-pink-200',
    ring: 'ring-pink-300',
    icon: '🦄'
  },
  purple: {
    bg: 'bg-purple-600',
    border: 'border-purple-200',
    ring: 'ring-purple-300',
    icon: '👑'
  },
  yellow: {
    bg: 'bg-amber-400',
    border: 'border-yellow-100',
    ring: 'ring-yellow-300',
    icon: '⭐'
  },
  cyan: {
    bg: 'bg-cyan-500',
    border: 'border-cyan-100',
    ring: 'ring-cyan-300',
    icon: '🌈'
  }
};

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  player,
  isActive,
  xPercent,
  yPercent,
  offset
}) => {
  const style = COLOR_STYLES[player.color];
  const xOffset = offset?.xOffsetPercent ?? 0;
  const yOffset = offset?.yOffsetPercent ?? 0;

  return (
    <div
      style={{
        left: `${xPercent + xOffset}%`,
        top: `${yPercent + yOffset}%`,
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-20 ${
        isActive ? 'scale-125 z-30' : 'scale-100 opacity-90'
      }`}
    >
      {/* Indicador de jogador ativo */}
      {isActive && (
        <div className="animate-bounce mb-0.5 text-xs">
          🔻
        </div>
      )}

      {/* Pino / Token Circular */}
      <div
        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full ${style.bg} border-2 ${style.border} flex items-center justify-center shadow-lg text-xs sm:text-base ${
          isActive ? `ring-4 ${style.ring} animate-pulse` : ''
        }`}
      >
        <span>{style.icon}</span>
      </div>

      {/* Rótulo com o Nome */}
      <span className="mt-0.5 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-black text-white bg-black/60 rounded-full truncate max-w-[60px] text-center shadow">
        {player.name}
      </span>
    </div>
  );
};

export default PlayerToken;
