import React, { useState, useEffect } from 'react';
import { Player } from '../core/types';

interface DiceControlProps {
  activePlayer: Player;
  isRolling: boolean;
  isMoving: boolean;
  lastRoll: number | null;
  onRoll: (rolledNumber: number) => void;
}

const COLOR_ACCENTS: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  pink: { 
    bg: 'from-pink-500 to-rose-500', 
    text: 'text-pink-600', 
    dot: 'bg-pink-600',
    border: 'border-pink-300' 
  },
  purple: { 
    bg: 'from-purple-600 to-indigo-600', 
    text: 'text-purple-600', 
    dot: 'bg-purple-600',
    border: 'border-purple-300' 
  },
  yellow: { 
    bg: 'from-amber-400 to-yellow-500', 
    text: 'text-amber-700', 
    dot: 'bg-amber-600',
    border: 'border-amber-300' 
  },
  cyan: { 
    bg: 'from-cyan-500 to-teal-500', 
    text: 'text-cyan-700', 
    dot: 'bg-cyan-600',
    border: 'border-cyan-300' 
  }
};

/**
 * Pips (pontos) em grade 3x3 para faces de dados de 1 a 6
 * Índices:
 * 0: superior-esquerdo  | 1: superior-centro  | 2: superior-direito
 * 3: meio-esquerdo      | 4: centro           | 5: meio-direito
 * 6: inferior-esquerdo  | 7: inferior-centro  | 8: inferior-direito
 */
const DICE_PIPS: Record<number, number[]> = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
};

export const DiceFaceVisual: React.FC<{ value: number; dotClass?: string }> = ({ 
  value, 
  dotClass = 'bg-pink-600' 
}) => {
  const activePips = DICE_PIPS[value] || DICE_PIPS[1];

  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-inner border-2 border-gray-200 p-1.5 grid grid-cols-3 grid-rows-3 gap-0.5 items-center justify-items-center">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => {
        const isFilled = activePips.includes(index);
        return (
          <div key={index} className="w-full h-full flex items-center justify-center">
            {isFilled && (
              <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${dotClass} shadow-sm animate-scaleIn`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const DiceControl: React.FC<DiceControlProps> = ({
  activePlayer,
  isRolling,
  isMoving,
  lastRoll,
  onRoll
}) => {
  const [displayRoll, setDisplayRoll] = useState<number>(lastRoll ?? 1);
  const [animatingSpin, setAnimatingSpin] = useState<boolean>(false);

  const isDisabled = isRolling || isMoving || animatingSpin;
  const accent = COLOR_ACCENTS[activePlayer.color] || COLOR_ACCENTS.pink;

  // Sincroniza se o estado pai atualizar o lastRoll
  useEffect(() => {
    if (lastRoll !== null && !animatingSpin) {
      setDisplayRoll(lastRoll);
    }
  }, [lastRoll, animatingSpin]);

  const handleClick = () => {
    if (isDisabled) return;

    // 1. Sorteia o número definitivo que SERÁ usado na rodada
    const definitiveRoll = Math.floor(Math.random() * 6) + 1;
    setAnimatingSpin(true);

    // 2. Animação de suspense girando as faces (6 passos rápidos)
    let step = 0;
    const interval = setInterval(() => {
      // Faces intermediárias aleatórias
      setDisplayRoll(Math.floor(Math.random() * 6) + 1);
      step++;

      if (step >= 7) {
        clearInterval(interval);
        // 3. Fixa exatamente o número definitivo e dispara o evento no pai
        setDisplayRoll(definitiveRoll);
        setAnimatingSpin(false);
        onRoll(definitiveRoll);
      }
    }, 65);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border-2 border-pink-200 select-none">
      {/* Informações do Jogador da Vez */}
      <div className="flex flex-col items-center text-center">
        <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">
          Vez de Jogar
        </span>
        <span className={`text-[11px] sm:text-xs font-black truncate max-w-[80px] ${accent.text}`}>
          {activePlayer.name}
        </span>
      </div>

      {/* Botão de Dado Físico Realista */}
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`p-1.5 rounded-2xl bg-gradient-to-br ${accent.bg} shadow-lg transition-transform active:scale-95 disabled:opacity-85 disabled:pointer-events-none select-none relative group flex flex-col items-center gap-1`}
        title="Toque para jogar o dado!"
      >
        {/* Face do Dado com Pips Reais */}
        <div className={`transform transition-transform ${animatingSpin ? 'rotate-12 scale-105' : ''}`}>
          <DiceFaceVisual value={displayRoll} dotClass={accent.dot} />
        </div>

        {/* Indicador Numérico Grande e Nítido para a Criança */}
        <div className="w-full py-0.5 bg-white/90 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm text-gray-800 shadow">
          {displayRoll}
        </div>

        {/* Pulso Indicador quando liberado para jogar */}
        {!isDisabled && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500 border border-white"></span>
          </span>
        )}
      </button>

      <span className="text-[8px] text-gray-400 font-bold text-center leading-tight">
        Rolar 🎲
      </span>
    </div>
  );
};

export default DiceControl;
