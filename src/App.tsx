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
    <div className="relative w-screen h-screen overflow-hidden bg-pink-100 flex flex-col select-none">
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

      {/* Barra de Notificação Superior Lúdica */}
      {notification && !activeSpecialEvent && !gameState.winner && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border-2 border-pink-300 text-xs sm:text-sm font-black text-pink-700 animate-slideDown flex items-center gap-2 max-w-[90vw] truncate">
          <span>{notification}</span>
        </div>
      )}

      {/* Botões de Ação Auxiliares no Topo Esquerdo */}
      <div className="absolute top-2 left-2 z-40 flex items-center gap-2">
        <button
          onClick={handleRestart}
          className="p-2 bg-white/90 hover:bg-white rounded-xl shadow-md border border-pink-200 text-xs font-bold text-pink-600 transition-all active:scale-95"
          title="Reiniciar Partida"
        >
          🔄 Reiniciar
        </button>

        {/* Botão para Calibrador de Coordenadas (Modo Dev) */}
        <button
          onClick={() => setShowCoordinatePicker(prev => !prev)}
          className={`p-2 rounded-xl shadow-md border text-[10px] font-black transition-all active:scale-95 ${
            showCoordinatePicker
              ? 'bg-yellow-400 hover:bg-yellow-300 text-yellow-950 border-yellow-500 ring-2 ring-yellow-200'
              : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300'
          }`}
          title="Alternar Ferramenta de Calibração"
        >
          {showCoordinatePicker ? '✖ Sair do Calibrador' : '🎯 Calibrador'}
        </button>
      </div>

      {/* Controle de Áudio Flutuante no Topo Direito */}
      <div className="absolute top-2 right-2 z-40">
        <AudioControl />
      </div>

      {/* Área Central: Visualização do Tabuleiro Oficial */}
      <main className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
        {showCoordinatePicker ? (
          <CoordinatePicker onClose={() => setShowCoordinatePicker(false)} />
        ) : (
          <BoardView
            players={gameState.players}
            activePlayerIndex={gameState.activePlayerIndex}
          />
        )}
      </main>

      {/* Controle Interativo do Dado */}
      {gameState.phase === 'playing' && activePlayer && !showCoordinatePicker && (
        <DiceControl
          activePlayer={activePlayer}
          isRolling={gameState.isRolling}
          isMoving={gameState.isMoving}
          lastRoll={gameState.lastDiceRoll}
          onRoll={handleRollDice}
        />
      )}
    </div>
  );
};

export default App;
