/**
 * Tipos e Contratos de Domínio do Jogo Tabuleiro Catarina 5 Anos
 * Camada de Domínio Puro (Hexagonal / Clean Architecture)
 * Nenhuma dependência de React, DOM ou bibliotecas externas.
 */

export type PlayerColor = 'pink' | 'purple' | 'yellow' | 'cyan';

export interface PlayerConfig {
  id: number;
  name: string;
  color: PlayerColor;
}

export interface Player extends PlayerConfig {
  currentPosition: number; // 0 = LARGADA, 1..51 = CASAS, 52 = CHEGADA
  skipNextTurn: boolean;   // Penalidade de ficar 1 rodada sem jogar
  hasWon: boolean;
}

export type SpecialActionType = 
  | 'advance'           // Avança N casas
  | 'retreat'           // Recua N casas
  | 'jump'              // Pula direto para uma casa fixa
  | 'skip_turn'         // Foto com unicórnio: fica 1 rodada sem jogar
  | 'roll_again_luck';  // Casa 13: minigame de sorte (ímpar +3, par -3)

export interface SpecialRule {
  tileNumber: number;
  title: string;
  description: string;
  actionType: SpecialActionType;
  value?: number; // Qtd de casas ou casa destino
}

export interface BoardCoordinate {
  tileNumber: number;
  xPercent: number; // 0 a 100
  yPercent: number; // 0 a 100
}

export interface TileOffset {
  playerId: number;
  xOffsetPercent: number;
  yOffsetPercent: number;
}

export type GamePhase = 'setup' | 'playing' | 'celebration';

export interface SpecialEventOccurrence {
  tileNumber: number;
  rule: SpecialRule;
  previousPosition: number;
  newPosition: number;
  luckRoll?: number;
  isOdd?: boolean;
}

export interface MoveStep {
  from: number;
  to: number;
  isBounceBack?: boolean;
}

export interface MoveResult {
  steps: MoveStep[];
  finalPosition: number;
  specialEvent?: SpecialEventOccurrence;
  hasWon: boolean;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  activePlayerIndex: number;
  lastDiceRoll: number | null;
  isRolling: boolean;
  isMoving: boolean;
  lastMoveResult: MoveResult | null;
  winner: Player | null;
}
