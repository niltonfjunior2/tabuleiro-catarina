import { GameState } from '../core/types';

const STORAGE_KEY = 'CATARINA_BOARD_GAME_STATE_V1';

export const storageService = {
  saveGameState(state: GameState): void {
    try {
      // Apenas salva partidas em andamento
      if (state.phase === 'playing') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else if (state.phase === 'setup' || state.winner) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignora silenciosamente caso o armazenamento local esteja desabilitado/cheio
    }
  },

  loadGameState(): GameState | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data) as GameState;
      // Validação básica de integridade
      if (parsed.players && Array.isArray(parsed.players) && parsed.players.length > 0) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  hasSavedGame(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  },

  clearSavedGame(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora silenciosamente
    }
  }
};

export default storageService;
