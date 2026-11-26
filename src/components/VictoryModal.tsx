import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '../core/types';
import { soundService } from '../services/soundService';

interface VictoryModalProps {
  winner: Player;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ winner, onRestart }) => {
  useEffect(() => {
    // Toca fanfarra triunfal
    soundService.playVictoryFanfare();

    // Dispara explosões de fogos de artifício com canvas-confetti
    const duration = 4.5 * 1000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      // Fogos disparados a partir da esquerda e da direita da tela
      confetti({
        startVelocity: 35,
        spread: 360,
        ticks: 70,
        origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() * 0.4 + 0.2 },
        colors: ['#ec4899', '#c084fc', '#fde047', '#38bdf8', '#ffffff']
      });

      confetti({
        startVelocity: 35,
        spread: 360,
        ticks: 70,
        origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() * 0.4 + 0.2 },
        colors: ['#ec4899', '#c084fc', '#fde047', '#38bdf8', '#ffffff']
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-4 border-yellow-300 animate-scaleUp flex flex-col items-center">
        {/* Coroa e Troféu */}
        <div className="text-6xl mb-2 animate-bounce">
          👑🦄🎉
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-pink-600 mb-1">
          PARABÉNS!
        </h2>

        <p className="text-base sm:text-lg font-black text-purple-700 mb-2">
          {winner.name} CHEGOU AO FINAL DO JOGO!
        </p>

        <p className="text-xs sm:text-sm text-gray-600 mb-6 font-medium">
          Você completou a jornada mágica dos unicórnios no aniversário de 5 anos da Catarina! ✨
        </p>

        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-black text-base rounded-2xl shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Jogar Novamente!</span>
          <span>🎲</span>
        </button>
      </div>
    </div>
  );
};

export default VictoryModal;
