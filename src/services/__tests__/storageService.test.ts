import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../storageService';
import { createInitialGameState } from '../../core';

describe('StorageService - Persistência Local da Partida', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('não deve salvar quando o jogo estiver na fase setup', () => {
    const state = createInitialGameState();
    state.phase = 'setup';
    storageService.saveGameState(state);
    expect(storageService.hasSavedGame()).toBe(false);
  });

  it('deve salvar e carregar o estado quando a fase for playing', () => {
    const state = createInitialGameState();
    state.phase = 'playing';
    state.players[0].currentPosition = 14;

    storageService.saveGameState(state);
    expect(storageService.hasSavedGame()).toBe(true);

    const loaded = storageService.loadGameState();
    expect(loaded).not.toBeNull();
    expect(loaded?.players[0].currentPosition).toBe(14);
    expect(loaded?.phase).toBe('playing');
  });

  it('deve limpar o estado salvo quando clearSavedGame for acionado', () => {
    const state = createInitialGameState();
    state.phase = 'playing';
    storageService.saveGameState(state);
    expect(storageService.hasSavedGame()).toBe(true);

    storageService.clearSavedGame();
    expect(storageService.hasSavedGame()).toBe(false);
    expect(storageService.loadGameState()).toBeNull();
  });
});
