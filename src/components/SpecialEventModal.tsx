import React, { useState } from 'react';
import { SpecialEventOccurrence } from '../core/types';
import { DiceFaceVisual } from './DiceControl';
import { soundService } from '../services/soundService';

interface SpecialEventModalProps {
  event: SpecialEventOccurrence;
  playerName: string;
  onDismiss: (luckRoll?: number) => void;
}

const EVENT_EMOJIS: Record<number, string> = {
  9: '💖🦄',
  13: '🎲✨',
  22: '📸🦄',
  29: '☁️😴',
  40: '🌈🚀',
  48: '🏁🏃‍♀️'
};

export const SpecialEventModal: React.FC<SpecialEventModalProps> = ({
  event,
  playerName,
  onDismiss
}) => {
  const emoji = EVENT_EMOJIS[event.tileNumber] || '🦄✨';
  const isCasa13 = event.tileNumber === 13;

  // Estado interativo para a rolagem manual da Casa 13 pela criança
  const [luckRoll, setLuckRoll] = useState<number | null>(event.luckRoll ?? null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayFace, setDisplayFace] = useState<number>(event.luckRoll ?? 1);

  const handleRollDice = () => {
    if (isRolling || luckRoll !== null) return;
    setIsRolling(true);
    soundService.playDiceRollSound();

    let step = 0;
    const interval = setInterval(() => {
      setDisplayFace(Math.floor(Math.random() * 6) + 1);
      step++;

      if (step >= 8) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDisplayFace(finalValue);
        setLuckRoll(finalValue);
        setIsRolling(false);

        if (finalValue % 2 !== 0) {
          soundService.playSpecialEventSound();
        } else {
          soundService.playStepSound(1);
        }
      }
    }, 70);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 select-none overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl p-4 sm:p-5 max-w-sm w-full max-h-[92dvh] overflow-y-auto overscroll-contain my-auto text-center shadow-2xl border-4 border-pink-300 animate-bounceOnce flex flex-col items-center">
        {/* Ícone Gigante */}
        <div className="text-5xl sm:text-6xl mb-2 animate-bounce">
          {emoji}
        </div>

        {/* Título do Evento */}
        <h3 className="text-xl sm:text-2xl font-black text-pink-600 mb-1">
          {event.rule.title}!
        </h3>

        {/* Nome do Jogador */}
        <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-black uppercase mb-3">
          {playerName}
        </span>

        {/* Mensagem e Efeito Explicado */}
        <p className="text-xs sm:text-sm text-gray-700 font-bold mb-4 leading-relaxed">
          {event.rule.description}
        </p>

        {/* Se for a Casa 13: Experiência interativa onde a criança joga o dado */}
        {isCasa13 ? (
          <div className="w-full flex flex-col items-center gap-3 mb-4">
            {/* Visual do Dado Interativo */}
            <button
              onClick={handleRollDice}
              disabled={isRolling || luckRoll !== null}
              className={`p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl transition-transform active:scale-95 disabled:pointer-events-none relative group flex flex-col items-center gap-1.5 ${
                luckRoll === null ? 'cursor-pointer animate-pulse' : ''
              }`}
              title={luckRoll === null ? 'Toque para girar o dado da sorte!' : 'Dado rolado!'}
            >
              <div className={`transform transition-transform ${isRolling ? 'rotate-45 scale-110' : ''}`}>
                <DiceFaceVisual value={displayFace} dotClass="bg-purple-600" />
              </div>
              <div className="w-full py-0.5 bg-white/95 rounded-lg flex items-center justify-center font-black text-xs sm:text-sm text-purple-900 shadow">
                {displayFace}
              </div>
            </button>

            {/* Status ou Instrução da Casa 13 */}
            {luckRoll === null ? (
              <button
                onClick={handleRollDice}
                disabled={isRolling}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>{isRolling ? 'GIRANDO...' : 'JOGAR O DADO! 🎲'}</span>
              </button>
            ) : (
              <div className="w-full flex flex-col items-center gap-2">
                <div
                  className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm font-black flex flex-col items-center gap-1 shadow-sm ${
                    luckRoll % 2 !== 0
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}
                >
                  <span className="text-base sm:text-lg">
                    {luckRoll % 2 !== 0 ? '🎉 ÍMPAR! (+3 casas)' : '🐾 PAR! (-3 casas)'}
                  </span>
                  <span className="text-[11px] font-bold">
                    {luckRoll % 2 !== 0
                      ? `Você tirou ${luckRoll}! Avança para a Casa 16!`
                      : `Você tirou ${luckRoll}! Volta para a Casa 10!`}
                  </span>
                </div>

                <button
                  onClick={() => onDismiss(luckRoll)}
                  className={`w-full py-2.5 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all ${
                    luckRoll % 2 !== 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500'
                  }`}
                >
                  {luckRoll % 2 !== 0 ? 'Avançar para Casa 16! 🦄' : 'Ir para Casa 10! 🐾'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Botão de Prosseguir para as demais casas */
          <button
            onClick={() => onDismiss()}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all"
          >
            Continuar! 🌟
          </button>
        )}
      </div>
    </div>
  );
};

export default SpecialEventModal;
