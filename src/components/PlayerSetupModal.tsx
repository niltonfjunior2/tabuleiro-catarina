import React, { useState } from 'react';
import { PlayerColor, PlayerConfig } from '../core/types';
import { InstallPWAButton } from './InstallPWAButton';

interface PlayerSetupModalProps {
  onStartGame: (players: PlayerConfig[]) => void;
  hasSavedGame?: boolean;
  onResumeSavedGame?: () => void;
}

const DEFAULT_PLAYERS: PlayerConfig[] = [
  { id: 1, name: 'Cat', color: 'pink' },
  { id: 2, name: 'Amigo 1', color: 'purple' },
  { id: 3, name: 'Amigo 2', color: 'yellow' },
  { id: 4, name: 'Amigo 3', color: 'cyan' },
];

const COLOR_OPTIONS: { color: PlayerColor; label: string; icon: string; bg: string }[] = [
  { color: 'pink', label: 'Rosa', icon: '🦄', bg: 'bg-pink-500' },
  { color: 'purple', label: 'Lilás', icon: '👑', bg: 'bg-purple-600' },
  { color: 'yellow', label: 'Amarelo', icon: '⭐', bg: 'bg-amber-400' },
  { color: 'cyan', label: 'Turquesa', icon: '🌈', bg: 'bg-cyan-500' },
];

export const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({ 
  onStartGame,
  hasSavedGame = false,
  onResumeSavedGame
}) => {
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [players, setPlayers] = useState<PlayerConfig[]>(DEFAULT_PLAYERS);

  const handleNameChange = (index: number, newName: string) => {
    setPlayers(prev => prev.map((p, i) => i === index ? { ...p, name: newName } : p));
  };

  const handleStart = () => {
    onStartGame(players.slice(0, playerCount));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      <div className="bg-white rounded-3xl p-3 sm:p-5 max-w-lg w-full max-h-[92dvh] overflow-y-auto overscroll-contain shadow-2xl border-4 border-pink-300 flex flex-col text-center animate-scaleUp my-auto">
        {/* Cabeçalho Festivo Compacto */}
        <div className="flex items-center justify-between mb-0.5 px-1">
          <div className="text-2xl sm:text-3xl animate-bounce">🦄✨</div>
          <InstallPWAButton />
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-pink-600 leading-tight">
          Cat no Reino dos Unicórnios
        </h2>
        <p className="text-[11px] sm:text-xs text-gray-500 mb-2 font-medium">
          Divirta-se no aniversário de 5 anos da Catarina
        </p>

        {/* Botão de Continuar Partida Anterior (caso exista save no localStorage) */}
        {hasSavedGame && onResumeSavedGame && (
          <div className="mb-2 p-2 sm:p-2.5 bg-purple-50 rounded-2xl border-2 border-purple-200 flex items-center justify-between gap-2">
            <span className="text-[11px] sm:text-xs text-purple-700 font-bold text-left leading-tight">
              Existe uma partida salva!
            </span>
            <button
              onClick={onResumeSavedGame}
              className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1 shrink-0"
            >
              <span>Continuar</span>
              <span>▶️</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] sm:text-xs text-gray-600 font-bold">
            Nova Partida: quantos amigos?
          </span>

          {/* Seletor de Quantidade de Jogadores */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setPlayerCount(num)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-xs sm:text-sm transition-all ${
                  playerCount === num
                    ? 'bg-pink-500 text-white scale-105 shadow-md ring-2 ring-pink-300'
                    : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Participantes Ativos em Grade de 2 Colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3 text-left">
          {players.slice(0, playerCount).map((p, idx) => {
            const opt = COLOR_OPTIONS.find(c => c.color === p.color) || COLOR_OPTIONS[0];
            return (
              <div 
                key={p.id} 
                className="flex items-center gap-1.5 p-1 rounded-xl bg-pink-50/70 border border-pink-200"
              >
                <div className={`w-7 h-7 rounded-full ${opt.bg} flex items-center justify-center text-xs text-white font-bold shadow shrink-0`}>
                  {opt.icon}
                </div>
                <input
                  type="text"
                  value={p.name}
                  onChange={e => handleNameChange(idx, e.target.value)}
                  maxLength={12}
                  className="w-full bg-white border border-pink-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-pink-400"
                  placeholder={`Jogador ${idx + 1}`}
                />
              </div>
            );
          })}
        </div>

        {/* Botão de Iniciar Partida */}
        <button
          onClick={handleStart}
          className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Começar Nova Aventura!</span>
          <span>🎲</span>
        </button>
      </div>
    </div>
  );
};

export default PlayerSetupModal;
