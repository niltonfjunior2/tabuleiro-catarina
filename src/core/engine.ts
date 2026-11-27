import { 
  Player, 
  PlayerConfig, 
  GameState, 
  SpecialRule, 
  MoveStep, 
  MoveResult, 
  SpecialEventOccurrence,
  TileOffset 
} from './types';
import defaultRules from '../data/board-rules.json';

export const START_POSITION = 0;
export const TOTAL_TILES = 51;
export const FINISH_POSITION = 52;

export const DEFAULT_PLAYER_CONFIGS: PlayerConfig[] = [
  { id: 1, name: 'Cat', color: 'pink' },
  { id: 2, name: 'Amigo 1', color: 'purple' },
  { id: 3, name: 'Amigo 2', color: 'yellow' },
  { id: 4, name: 'Amigo 3', color: 'cyan' },
];

/**
 * Cria o estado inicial da partida com a lista de participantes.
 */
export function createInitialGameState(configs: PlayerConfig[] = DEFAULT_PLAYER_CONFIGS): GameState {
  if (configs.length < 1 || configs.length > 4) {
    throw new Error('O jogo suporta de 1 a 4 jogadores.');
  }

  const players: Player[] = configs.map(config => ({
    ...config,
    currentPosition: START_POSITION,
    skipNextTurn: false,
    hasWon: false
  }));

  return {
    phase: 'setup',
    players,
    activePlayerIndex: 0,
    lastDiceRoll: null,
    isRolling: false,
    isMoving: false,
    lastMoveResult: null,
    winner: null
  };
}

/**
 * Calcula a posição alvo considerando o ricochete (bate e volta) na CHEGADA (52).
 */
export function calculateTargetPosition(currentPosition: number, diceRoll: number): number {
  if (diceRoll <= 0) return currentPosition;
  const rawTarget = currentPosition + diceRoll;

  if (rawTarget <= FINISH_POSITION) {
    return rawTarget;
  }

  const overflow = rawTarget - FINISH_POSITION;
  return FINISH_POSITION - overflow;
}

/**
 * Gera a sequência casa a casa percorrida pelo peão (incluindo o ricochete se houver).
 * Essencial para guiar a animação passo a passo para as crianças.
 */
export function generateMoveSteps(currentPosition: number, diceRoll: number): MoveStep[] {
  const steps: MoveStep[] = [];
  let curr = currentPosition;
  let remaining = diceRoll;
  let isBouncing = false;

  while (remaining > 0) {
    if (!isBouncing) {
      const next = curr + 1;
      steps.push({ from: curr, to: next, isBounceBack: false });
      curr = next;
      if (curr === FINISH_POSITION && remaining > 1) {
        isBouncing = true;
      }
    } else {
      const next = curr - 1;
      steps.push({ from: curr, to: next, isBounceBack: true });
      curr = next;
    }
    remaining--;
  }

  return steps;
}

/**
 * Avalia se a casa em que o jogador aterrissou possui uma regra especial.
 * Suporta injeção de dado para o minigame da casa 13 (para testes determinísticos).
 */
export function evaluateSpecialTile(
  tileNumber: number, 
  customLuckRoll?: number,
  rules: SpecialRule[] = defaultRules as SpecialRule[]
): { finalPosition: number; event?: SpecialEventOccurrence } {
  const rule = rules.find(r => r.tileNumber === tileNumber);
  if (!rule) {
    return { finalPosition: tileNumber };
  }

  switch (rule.actionType) {
    case 'advance': {
      const advanceAmount = rule.value ?? 0;
      const target = Math.min(tileNumber + advanceAmount, FINISH_POSITION);
      return {
        finalPosition: target,
        event: {
          tileNumber,
          rule,
          previousPosition: tileNumber,
          newPosition: target
        }
      };
    }

    case 'jump': {
      const target = rule.value ?? tileNumber;
      return {
        finalPosition: target,
        event: {
          tileNumber,
          rule,
          previousPosition: tileNumber,
          newPosition: target
        }
      };
    }

    case 'skip_turn': {
      return {
        finalPosition: tileNumber,
        event: {
          tileNumber,
          rule,
          previousPosition: tileNumber,
          newPosition: tileNumber
        }
      };
    }

    case 'roll_again_luck': {
      // Casa 13: Se ímpar avança 3 (para 16), se par volta 3 (para 10)
      const roll = customLuckRoll ?? (Math.floor(Math.random() * 6) + 1);
      const isOdd = roll % 2 !== 0;
      const target = isOdd ? tileNumber + 3 : Math.max(tileNumber - 3, START_POSITION);
      return {
        finalPosition: target,
        event: {
          tileNumber,
          rule,
          previousPosition: tileNumber,
          newPosition: target,
          luckRoll: roll,
          isOdd
        }
      };
    }

    default:
      return { finalPosition: tileNumber };
  }
}

/**
 * Calcula o deslocamento (offset) em grade para quando múltiplos peões
 * dividem a mesma casa amigavelmente sem sobreposição total.
 */
export function calculateTileOffsets(players: Player[], tileNumber: number): Map<number, TileOffset> {
  const playersOnTile = players.filter(p => p.currentPosition === tileNumber);
  const offsetMap = new Map<number, TileOffset>();

  // Coordenadas relativas de arranjo em quadrantes (offset % da caixa da casa)
  const QUADRANT_OFFSETS = [
    { x: -1.2, y: -1.2 }, // superior esquerdo
    { x: 1.2, y: -1.2 },  // superior direito
    { x: -1.2, y: 1.2 },  // inferior esquerdo
    { x: 1.2, y: 1.2 },   // inferior direito
  ];

  playersOnTile.forEach((player, index) => {
    if (playersOnTile.length === 1) {
      offsetMap.set(player.id, { playerId: player.id, xOffsetPercent: 0, yOffsetPercent: 0 });
    } else {
      const offset = QUADRANT_OFFSETS[index % QUADRANT_OFFSETS.length];
      offsetMap.set(player.id, { 
        playerId: player.id, 
        xOffsetPercent: offset.x, 
        yOffsetPercent: offset.y 
      });
    }
  });

  return offsetMap;
}

/**
 * Executa a jogada completa para o jogador ativo dado o resultado do dado.
 */
export function executeMove(
  state: GameState, 
  diceRoll: number, 
  customLuckRoll?: number
): { nextState: GameState; moveResult: MoveResult } {
  const activePlayer = state.players[state.activePlayerIndex];
  if (!activePlayer || state.winner) {
    throw new Error('Jogada inválida ou jogo já finalizado.');
  }

  // 1. Gera passos físicos casa a casa com suporte a ricochete
  const steps = generateMoveSteps(activePlayer.currentPosition, diceRoll);
  const intermediatePosition = steps.length > 0 ? steps[steps.length - 1].to : activePlayer.currentPosition;

  // 2. Avalia eventos de casas especiais
  const specialOutcome = evaluateSpecialTile(intermediatePosition, customLuckRoll);
  const finalPosition = specialOutcome.finalPosition;
  const hasWon = finalPosition === FINISH_POSITION;

  // Se a casa for skip_turn (Casa 22), marca a penalidade para a próxima rodada
  const willSkipNext = specialOutcome.event?.rule.actionType === 'skip_turn';

  const moveResult: MoveResult = {
    steps,
    finalPosition,
    specialEvent: specialOutcome.event,
    hasWon
  };

  // 3. Atualiza os jogadores
  const updatedPlayers = state.players.map((p, idx) => {
    if (idx !== state.activePlayerIndex) return p;
    return {
      ...p,
      currentPosition: finalPosition,
      skipNextTurn: willSkipNext ? true : p.skipNextTurn,
      hasWon
    };
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    lastDiceRoll: diceRoll,
    lastMoveResult: moveResult,
    phase: hasWon ? 'celebration' : 'playing',
    winner: hasWon ? updatedPlayers[state.activePlayerIndex] : null
  };

  return { nextState, moveResult };
}

/**
 * Transiciona o turno para o próximo jogador, tratando a penalidade de suspensão de rodada.
 */
export function advanceTurn(state: GameState): { nextState: GameState; skippedPlayerName?: string } {
  if (state.winner || state.players.length === 0) {
    return { nextState: state };
  }

  let nextIndex = (state.activePlayerIndex + 1) % state.players.length;
  let skippedName: string | undefined = undefined;

  // Se o próximo jogador estiver com skipNextTurn ativo, consome a penalidade e passa a vez
  if (state.players[nextIndex].skipNextTurn) {
    skippedName = state.players[nextIndex].name;
    const updatedPlayers = state.players.map((p, idx) => {
      if (idx === nextIndex) {
        return { ...p, skipNextTurn: false };
      }
      return p;
    });

    nextIndex = (nextIndex + 1) % state.players.length;

    return {
      nextState: {
        ...state,
        players: updatedPlayers,
        activePlayerIndex: nextIndex,
        lastDiceRoll: null,
        lastMoveResult: null
      },
      skippedPlayerName: skippedName
    };
  }

  return {
    nextState: {
      ...state,
      activePlayerIndex: nextIndex,
      lastDiceRoll: null,
      lastMoveResult: null
    }
  };
}
