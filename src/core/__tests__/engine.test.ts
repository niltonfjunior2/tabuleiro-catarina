import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  calculateTargetPosition,
  generateMoveSteps,
  evaluateSpecialTile,
  calculateTileOffsets,
  executeMove,
  advanceTurn,
  determineNextRollValue,
  START_POSITION,
  FINISH_POSITION
} from '../engine';
import { PlayerConfig } from '../types';

describe('GameEngine - Cat no Reino dos Unicórnios', () => {
  const customPlayers: PlayerConfig[] = [
    { id: 1, name: 'Cat', color: 'pink' },
    { id: 2, name: 'Helena', color: 'purple' },
    { id: 3, name: 'Lucas', color: 'yellow' }
  ];

  describe('Inicialização do Estado', () => {
    it('deve inicializar com o número correto de jogadores e posições na Largada (0)', () => {
      const state = createInitialGameState(customPlayers);
      expect(state.players).toHaveLength(3);
      expect(state.phase).toBe('setup');
      expect(state.activePlayerIndex).toBe(0);
      expect(state.players[0].currentPosition).toBe(START_POSITION);
      expect(state.players[0].skipNextTurn).toBe(false);
      expect(state.winner).toBeNull();
    });

    it('deve lançar erro se tentar criar jogo com menos de 1 ou mais de 4 jogadores', () => {
      expect(() => createInitialGameState([])).toThrow();
      const fivePlayers: PlayerConfig[] = [
        { id: 1, name: '1', color: 'pink' },
        { id: 2, name: '2', color: 'purple' },
        { id: 3, name: '3', color: 'yellow' },
        { id: 4, name: '4', color: 'cyan' },
        { id: 5, name: '5', color: 'pink' }
      ];
      expect(() => createInitialGameState(fivePlayers)).toThrow();
    });
  });

  describe('Cálculo de Passos e Bate-e-Volta (Ricochete)', () => {
    it('deve calcular passos lineares normais quando não atinge a meta', () => {
      const target = calculateTargetPosition(0, 5);
      expect(target).toBe(5);

      const steps = generateMoveSteps(0, 3);
      expect(steps).toEqual([
        { from: 0, to: 1, isBounceBack: false },
        { from: 1, to: 2, isBounceBack: false },
        { from: 2, to: 3, isBounceBack: false }
      ]);
    });

    it('deve atingir a CHEGADA (52) com valor exato', () => {
      expect(calculateTargetPosition(50, 2)).toBe(FINISH_POSITION);
      const steps = generateMoveSteps(50, 2);
      expect(steps).toHaveLength(2);
      expect(steps[1].to).toBe(FINISH_POSITION);
      expect(steps[1].isBounceBack).toBe(false);
    });

    it('deve ricochetear (bate e volta) quando o valor do dado excede a CHEGADA (52)', () => {
      // Estando na casa 50 e tirando 4: vai até 52 (2 passos) e volta 2 para a casa 50
      expect(calculateTargetPosition(50, 4)).toBe(50);

      const steps = generateMoveSteps(50, 4);
      expect(steps).toHaveLength(4);
      expect(steps).toEqual([
        { from: 50, to: 51, isBounceBack: false },
        { from: 51, to: 52, isBounceBack: false },
        { from: 52, to: 51, isBounceBack: true },
        { from: 51, to: 50, isBounceBack: true }
      ]);
    });
  });

  describe('Casas Especiais Oficiais do Tabuleiro', () => {
    it('Casa 9: deve avançar 5 casas (9 -> 14)', () => {
      const result = evaluateSpecialTile(9);
      expect(result.finalPosition).toBe(14);
      expect(result.event?.rule.title).toBe('Melhores Amigos');
    });

    it('Casa 13: minigame da sorte com número ímpar deve avançar 3 casas (13 -> 16)', () => {
      const result = evaluateSpecialTile(13, 3); // 3 é ímpar
      expect(result.finalPosition).toBe(16);
      expect(result.event?.luckRoll).toBe(3);
      expect(result.event?.isOdd).toBe(true);
    });

    it('Casa 13: minigame da sorte com número par deve recuar 3 casas (13 -> 10)', () => {
      const result = evaluateSpecialTile(13, 4); // 4 é par
      expect(result.finalPosition).toBe(10);
      expect(result.event?.luckRoll).toBe(4);
      expect(result.event?.isOdd).toBe(false);
    });

    it('Casa 22: foto com unicórnio deve disparar evento de pular rodada', () => {
      const result = evaluateSpecialTile(22);
      expect(result.finalPosition).toBe(22);
      expect(result.event?.rule.actionType).toBe('skip_turn');
    });

    it('Casa 29: soninho revigorante deve saltar direto para a casa 35', () => {
      const result = evaluateSpecialTile(29);
      expect(result.finalPosition).toBe(35);
    });

    it('Casa 40: atalho deve avançar 4 casas (40 -> 44)', () => {
      const result = evaluateSpecialTile(40);
      expect(result.finalPosition).toBe(44);
    });

    it('Casa 48: corrida linda deve saltar direto para a CHEGADA (52)', () => {
      const result = evaluateSpecialTile(48);
      expect(result.finalPosition).toBe(FINISH_POSITION);
    });
  });

  describe('Colisão Amigável e Dispersão de Peças', () => {
    it('deve gerar offsets distribuídos quando 2 jogadores estão na mesma casa', () => {
      const state = createInitialGameState(customPlayers);
      // Todos começam na casa 0
      const offsets = calculateTileOffsets(state.players, 0);
      expect(offsets.size).toBe(3);
      // Offsets não devem ser todos (0, 0)
      const offsetP1 = offsets.get(1);
      const offsetP2 = offsets.get(2);
      expect(offsetP1).toBeDefined();
      expect(offsetP2).toBeDefined();
      expect(offsetP1?.xOffsetPercent).not.toBe(offsetP2?.xOffsetPercent);
    });
  });

  describe('Ciclo Completo de Jogadas e Turnos', () => {
    it('deve executar jogada, atualizar posição e passar a vez', () => {
      const state = createInitialGameState(customPlayers);
      
      // Jogador 1 tira 4: vai para a casa 4
      const { nextState, moveResult } = executeMove(state, 4);
      expect(nextState.players[0].currentPosition).toBe(4);
      expect(moveResult.finalPosition).toBe(4);
      expect(nextState.phase).toBe('playing');

      // Avança turno: vez do Jogador 2
      const turn2 = advanceTurn(nextState);
      expect(turn2.nextState.activePlayerIndex).toBe(1);
    });

    it('deve aplicar penalidade de suspensão quando jogador cai na casa 22', () => {
      const state = createInitialGameState(customPlayers);
      // Força o Jogador 1 a cair na casa 22 (22 a partir do 0)
      const { nextState } = executeMove(state, 22);
      expect(nextState.players[0].skipNextTurn).toBe(true);

      // Passa a vez para o Jogador 2
      const turnP2 = advanceTurn(nextState).nextState;
      expect(turnP2.activePlayerIndex).toBe(1);

      // Passa a vez para o Jogador 3
      const turnP3 = advanceTurn(turnP2).nextState;
      expect(turnP3.activePlayerIndex).toBe(2);

      // Quando voltaria para o Jogador 1 (que está suspenso): o sistema deve pular o Jogador 1 e passar direto para o Jogador 2!
      const skippedTurn = advanceTurn(turnP3);
      expect(skippedTurn.skippedPlayerName).toBe('Cat');
      expect(skippedTurn.nextState.players[0].skipNextTurn).toBe(false); // penalidade consumida
      expect(skippedTurn.nextState.activePlayerIndex).toBe(1); // passou para Helena
    });

    it('deve declarar vitória quando o jogador aterrissa exatamente na CHEGADA (52)', () => {
      const state = createInitialGameState(customPlayers);
      // Coloca jogador na casa 50
      state.players[0].currentPosition = 50;

      // Tira 2 no dado
      const { nextState } = executeMove(state, 2);
      expect(nextState.players[0].currentPosition).toBe(FINISH_POSITION);
      expect(nextState.players[0].hasWon).toBe(true);
      expect(nextState.phase).toBe('celebration');
      expect(nextState.winner?.name).toBe('Cat');
    });
  });

  describe('Regra Oculta Anti-Estagnação na Reta Final (Mercy Rule)', () => {
    it('deve contabilizar tentativas frustradas quando jogador na reta final (>= 47) sofre ricochete', () => {
      const state = createInitialGameState(customPlayers);
      state.players[0].currentPosition = 50; // precisa de 2 para vencer

      // Jogador tira 4 (bate e volta: 50 -> 52 -> 50)
      const { nextState } = executeMove(state, 4);
      expect(nextState.players[0].currentPosition).toBe(50);
      expect(nextState.failedFinishAttempts).toBe(1);
    });

    it('não deve contabilizar tentativas frustradas se o jogador ainda estiver longe da chegada (< 47)', () => {
      const state = createInitialGameState(customPlayers);
      state.players[0].currentPosition = 30;

      const { nextState } = executeMove(state, 4);
      expect(nextState.players[0].currentPosition).toBe(34);
      expect(nextState.failedFinishAttempts).toBe(0);
    });

    it('deve forçar o valor exato para vitória após 5 tentativas frustradas se o jogador estiver a 5 casas ou menos da meta', () => {
      const state = createInitialGameState(customPlayers);
      state.failedFinishAttempts = 5;

      // Jogador na casa 50 (distância 2)
      state.players[0].currentPosition = 50;
      expect(determineNextRollValue(state)).toBe(2);

      // Jogador na casa 48 (distância 4)
      state.players[0].currentPosition = 48;
      expect(determineNextRollValue(state)).toBe(4);

      // Jogador na casa 47 (distância 5)
      state.players[0].currentPosition = 47;
      expect(determineNextRollValue(state)).toBe(5);

      // Jogador na casa 51 (distância 1)
      state.players[0].currentPosition = 51;
      expect(determineNextRollValue(state)).toBe(1);
    });

    it('não deve forçar vitória se o jogador estiver a mais de 5 casas da chegada mesmo com 5 tentativas frustradas acumuladas', () => {
      const state = createInitialGameState(customPlayers);
      state.failedFinishAttempts = 5;
      state.players[0].currentPosition = 40; // distância 12 (> 5)

      const roll = determineNextRollValue(state);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(6);
    });

    it('deve resetar o contador de tentativas frustradas para 0 quando qualquer jogador vence', () => {
      const state = createInitialGameState(customPlayers);
      state.failedFinishAttempts = 5;
      state.players[0].currentPosition = 50;

      // Executa o movimento vencedor
      const { nextState } = executeMove(state, 2);
      expect(nextState.players[0].hasWon).toBe(true);
      expect(nextState.failedFinishAttempts).toBe(0);
    });
  });
});
