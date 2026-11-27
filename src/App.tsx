import React, { useState, useEffect } from 'react';
import { 
  GameState, 
  PlayerConfig, 
  SpecialEventOccurrence,
  createInitialGameState, 
  generateMoveSteps, 
  executeMove, 
  advanceTurn 
} from './core';
import { BoardView } from './components/BoardView';
import { DiceControl } from './components/DiceControl';
import { PlayerSetupModal } from './components/PlayerSetupModal';
import { LandscapeGuard } from './components/LandscapeGuard';
import { AudioControl } from './components/AudioControl';
import { InstallPWAButton } from './components/InstallPWAButton';
import { FullscreenButton } from './components/FullscreenButton';
import { SpecialEventModal } from './components/SpecialEventModal';
import { VictoryModal } from './components/VictoryModal';
import { CoordinatePicker } from './dev/CoordinatePicker';
import { soundService } from './services/soundService';
import { storageService } from './services/storageService';
import { wakeLockService } from './services/wakeLockService';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [notification, setNotification] = useState<string | null>(null);
  const [activeSpecialEvent, setActiveSpecialEvent] = useState<{ event: SpecialEventOccurrence; playerName: string } | null>(null);
  const [showCoordinatePicker, setShowCoordinatePicker] = useState<boolean>(false);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);

  // Inicializa auto-reacquire do Wake Lock e checa se há save no localStorage
  useEffect(() => {
    wakeLockService.initAutoReacquire();
    setHasSavedGame(storageService.hasSavedGame());
  }, []);

  // Salva o estado da partida sempre que houver alteração
  useEffect(() => {
    storageService.saveGameState(gameState);
    if (gameState.phase === 'playing' && !gameState.winner) {
      wakeLockService.requestLock().catch(() => {});
    } else {
      wakeLockService.releaseLock();
    }
  }, [gameState]);

  const activePlayer = gameState.players[gameState.activePlayerIndex];

  // Iniciar nova partida
  const handleStartGame = (playerConfigs: PlayerConfig[]) => {
    soundService.unlock();
    storageService.clearSavedGame();
    const newState = createInitialGameState(playerConfigs);
    newState.phase = 'playing';
    setGameState(newState);
    setHasSavedGame(false);
    setNotification(`Vez de ${playerConfigs[0].name}! Toque no dado para jogar! 🎲`);
  };

  // Retomar partida existente salva
  const handleResumeSavedGame = () => {
    const saved = storageService.loadGameState();
    if (saved) {
      soundService.unlock();
      setGameState(saved);
      setNotification(`Partida retomada! Vez de ${saved.players[saved.activePlayerIndex]?.name}! 🎲`);
    }
  };

  // Rolagem e caminhada passo a passo (hop step perfeitamente sincronizado com o dado)
  const handleRollDice = (diceValue: number) => {
    if (gameState.isRolling || gameState.isMoving || !activePlayer || gameState.winner) {
      return;
    }

    soundService.unlock();
    soundService.playDiceRollSound();

    setGameState(prev => ({ 
      ...prev, 
      isRolling: false, 
      isMoving: true, 
      lastDiceRoll: diceValue 
    }));
    setNotification(`🎲 ${activePlayer.name} tirou ${diceValue} no dado!`);

    // 1. Gera os passos físicos da caminhada
    const steps = generateMoveSteps(activePlayer.currentPosition, diceValue);

    // 2. Animação passo a passo com som para cada casa (280ms)
    let stepIdx = 0;

    const stepInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        const currentStep = steps[stepIdx];
        soundService.playStepSound(stepIdx + 1);

        setGameState(prev => ({
          ...prev,
          players: prev.players.map((p, i) => 
            i === prev.activePlayerIndex ? { ...p, currentPosition: currentStep.to } : p
          )
        }));

        setNotification(
          `🐾 ${activePlayer.name} andando: casa ${currentStep.to} (${stepIdx + 1} de ${diceValue})`
        );
        stepIdx++;
      } else {
        clearInterval(stepInterval);

        // 3. Conclui o movimento e processa regras de casas especiais / bate e volta
        const { nextState, moveResult } = executeMove(gameState, diceValue);

        let message = `⭐ ${activePlayer.name} andou ${diceValue} casas e parou na casa ${moveResult.finalPosition}!`;

        // Trata eventos especiais
        if (moveResult.specialEvent) {
          message = `✨ ${activePlayer.name}: ${moveResult.specialEvent.rule.title}!`;
          
          if (moveResult.specialEvent.rule.actionType === 'skip_turn') {
            soundService.playCameraSound();
          } else {
            soundService.playSpecialEventSound();
          }

          // Exibe modal lúdico do evento especial
          setActiveSpecialEvent({
            event: moveResult.specialEvent,
            playerName: activePlayer.name
          });
        }

        if (moveResult.hasWon) {
          message = `🎉 PARABÉNS, ${activePlayer.name} CHEGOU E VENCEU O JOGO! 🦄👑`;
          storageService.clearSavedGame();
        }

        setNotification(message);
        setGameState(nextState);

        // 4. Passagem de turno (caso não haja modal de evento e não seja vitória)
        if (!moveResult.hasWon && !moveResult.specialEvent) {
          setTimeout(() => {
            const { nextState: turnedState, skippedPlayerName } = advanceTurn(nextState);
            if (skippedPlayerName) {
              setNotification(`📸 ${skippedPlayerName} tirou foto com o unicórnio e descansou a rodada!`);
            } else {
              const nextPlayer = turnedState.players[turnedState.activePlayerIndex];
              setNotification(`Vez de ${nextPlayer?.name}! Toque no dado! 🎲`);
            }
            setGameState(turnedState);
          }, 1200);
        }
      }
    }, 280);
  };

  // Dispensar modal de evento especial e passar o turno
  const handleDismissSpecialEvent = () => {
    setActiveSpecialEvent(null);
    if (!gameState.winner) {
      setTimeout(() => {
        const { nextState: turnedState, skippedPlayerName } = advanceTurn(gameState);
        if (skippedPlayerName) {
          setNotification(`📸 ${skippedPlayerName} tirou foto com o unicórnio e descansou a rodada!`);
        } else {
          const nextPlayer = turnedState.players[turnedState.activePlayerIndex];
          setNotification(`Vez de ${nextPlayer?.name}! Toque no dado! 🎲`);
        }
        setGameState(turnedState);
      }, 400);
    }
  };

  const handleRestart = () => {
    storageService.clearSavedGame();
    setGameState(prev => ({ ...prev, phase: 'setup', winner: null }));
    setActiveSpecialEvent(null);
    setNotification(null);
    setHasSavedGame(false);
  };

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-pink-100 flex flex-col select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      {/* Alerta de Modo Paisagem para Celulares e Tablets */}
      <LandscapeGuard />

      {/* Modal de Configuração de Participantes */}
      {gameState.phase === 'setup' && (
        <PlayerSetupModal 
          onStartGame={handleStartGame} 
          hasSavedGame={hasSavedGame}
          onResumeSavedGame={handleResumeSavedGame}
        />
      )}

      {/* Modal de Eventos Especiais */}
      {activeSpecialEvent && (
        <SpecialEventModal
          event={activeSpecialEvent.event}
          playerName={activeSpecialEvent.playerName}
          onDismiss={handleDismissSpecialEvent}
        />
      )}

      {/* Modal de Celebração de Vitória com Fogos de Artifício */}
      {gameState.winner && (
        <VictoryModal
          winner={gameState.winner}
          onRestart={handleRestart}
        />
      )}

      {/* Barra Superior Dedicada (Header): Controles e Notificações sem Sobrepor o Tabuleiro */}
      <header className="w-full h-8 sm:h-9 px-2 shrink-0 bg-pink-200/60 backdrop-blur-sm border-b border-pink-300/60 flex items-center justify-between gap-1 sm:gap-2 z-30">
        {/* Botões de Ação Auxiliares no Topo Esquerdo */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={handleRestart}
            className="px-2 py-1 bg-white/90 hover:bg-white rounded-lg shadow-sm border border-pink-200 text-[11px] sm:text-xs font-bold text-pink-600 transition-all active:scale-95 flex items-center gap-1"
            title="Reiniciar Partida"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Reiniciar</span>
          </button>

          {/* Botão para Instalar o PWA */}
          <InstallPWAButton />

          {/* Botão de Tela Cheia para Navegadores Web */}
          <FullscreenButton />

          {/* Botão para Calibrador de Coordenadas (Modo Dev) */}
          <button
            onClick={() => setShowCoordinatePicker(prev => !prev)}
            className={`px-1.5 py-1 rounded-lg shadow-sm border text-[10px] sm:text-[11px] font-black transition-all active:scale-95 flex items-center gap-1 ${
              showCoordinatePicker
                ? 'bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-yellow-500 ring-2 ring-yellow-200'
                : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300'
            }`}
            title="Alternar Ferramenta de Calibração"
          >
            <span>🎯</span>
            <span className="hidden md:inline">{showCoordinatePicker ? 'Sair' : 'Calibrar'}</span>
          </button>
        </div>

        {/* Notificação Central Lúdica */}
        <div className="flex-1 min-w-0 flex items-center justify-center px-1">
          {notification && !activeSpecialEvent && !gameState.winner && (
            <div className="bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-0.5 rounded-full shadow-sm border border-pink-300 text-[11px] sm:text-xs font-black text-pink-700 animate-slideDown flex items-center gap-1.5 max-w-full truncate">
              <span className="truncate">{notification}</span>
            </div>
          )}
        </div>

        {/* Controle de Áudio no Topo Direito */}
        <div className="shrink-0 flex items-center">
          <AudioControl />
        </div>
      </header>

      {/* Área Principal: Tabuleiro à Esquerda e Dock Lateral do Dado à Direita */}
      <div className="flex-1 w-full min-h-0 relative overflow-hidden flex items-center justify-between p-1 box-border gap-1 sm:gap-2">
        {/* Visualização do Tabuleiro Oficial (100% desobstruído) */}
        <main className="flex-1 h-full min-h-0 min-w-0 relative overflow-hidden flex items-center justify-center">
          {showCoordinatePicker ? (
            <CoordinatePicker onClose={() => setShowCoordinatePicker(false)} />
          ) : (
            <BoardView
              players={gameState.players}
              activePlayerIndex={gameState.activePlayerIndex}
            />
          )}
        </main>

        {/* Painel Lateral Direito: Controle do Dado e Vez do Jogador (Ergonomia para o Polegar) */}
        {gameState.phase === 'playing' && activePlayer && !showCoordinatePicker && (
          <aside className="h-full flex items-center justify-center shrink-0 pr-1 z-20">
            <DiceControl
              activePlayer={activePlayer}
              isRolling={gameState.isRolling}
              isMoving={gameState.isMoving}
              lastRoll={gameState.lastDiceRoll}
              onRoll={handleRollDice}
            />
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;
