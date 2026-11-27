import React from 'react';
import { SpecialEventOccurrence } from '../core/types';

interface SpecialEventModalProps {
  event: SpecialEventOccurrence;
  playerName: string;
  onDismiss: () => void;
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

        {/* Detalhe extra caso seja a Casa 13 (Sorte) */}
        {event.luckRoll !== undefined && (
          <div className="p-2 mb-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-700 font-bold">
            Tirou <strong>{event.luckRoll}</strong> no dado ({event.isOdd ? 'Ímpar → Avança 3!' : 'Par → Volta 3!'})
          </div>
        )}

        {/* Botão de Prosseguir */}
        <button
          onClick={onDismiss}
          className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-sm rounded-xl shadow-lg active:scale-95 transition-all"
        >
          Continuar! 🌟
        </button>
      </div>
    </div>
  );
};

export default SpecialEventModal;
