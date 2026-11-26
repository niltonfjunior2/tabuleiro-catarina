import React, { useState } from 'react';
import { PlayerColor, PlayerConfig } from '../core/types';
import { InstallPWAButton } from './InstallPWAButton';

interface PlayerSetupModalProps {
  onStartGame: (players: PlayerConfig[]) => void;
  hasSavedGame?: boolean;
  onResumeSavedGame?: () => void;
}

const DEFAULT_PLAYERS: PlayerConfig[] = [
  { id: 1, name: 'Catarina', color: 'pink' },
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 select-none">
      <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl border-4 border-pink-300 flex flex-col text-center animate-scaleUp">
        {/* Cabeçalho Festivo */}
        <div className="flex items-center justify-between mb-1 px-1">
          <div className="text-3xl animate-bounce">🦄✨</div>
          <InstallPWAButton />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-pink-600">
          Tabuleiro da Catarina
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-3 font-medium">
          Aniversário de 5 Anos no Reino dos Unicórnios!
        </p>

        {/* Botão de Continuar Partida Anterior (caso exista save no localStorage) */}
        {hasSavedGame && onResumeSavedGame && (
          <div className="mb-4 p-3 bg-purple-50 rounded-2xl border-2 border-purple-200">
            <span className="text-xs text-purple-700 font-bold block mb-1.5">
              Existe uma partida em andamento salva!
            </span>
            <button
              onClick={onResumeSavedGame}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Continuar Jogo Salvo</span>
              <span>▶️</span>
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 mb-2 font-bold text-left">
          Ou inicie uma Nova Partida:
        </p>

        {/* Seletor de Quantidade de Jogadores */}
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => setPlayerCount(num)}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl font-black text-xs sm:text-sm transition-all ${
                playerCount === num
                  ? 'bg-pink-500 text-white scale-110 shadow-lg ring-4 ring-pink-200'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Lista de Participantes Ativos */}
        <div className="space-y-1.5 mb-4 text-left max-h-36 overflow-y-auto px-1">
          {players.slice(0, playerCount).map((p, idx) => {
            const opt = COLOR_OPTIONS.find(c => c.color === p.color) || COLOR_OPTIONS[0];
            return (
              <div 
                key={p.id} 
                className="flex items-center gap-2 p-1.5 rounded-xl bg-pink-50/70 border border-pink-200"
              >
                <div className={`w-7 h-7 rounded-full ${opt.bg} flex items-center justify-center text-xs text-white font-bold shadow`}>
                  {opt.icon}
                </div>
                <input
                  type="text"
                  value={p.name}
                  onChange={e => handleNameChange(idx, e.target.value)}
                  maxLength={12}
                  className="flex-1 bg-white border border-pink-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
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
