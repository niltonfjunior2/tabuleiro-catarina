/**
 * Serviço de Áudio e Efeitos Sonoros para o Tabuleiro Catarina 5 Anos
 * Implementado com Web Audio API nativa.
 * 
 * Vantagens Arquiteturais:
 * 1. Zero kilobytes de dependências de arquivos de áudio externos (100% offline).
 * 2. Tons mágicos de caixinha de música e celesta relaxantes para crianças de 5 anos.
 * 3. Desbloqueio seguro no primeiro gesto do usuário contornando restrições de autoplay.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlock() {
    this.initContext();
    if (!this.isBgmPlaying && !this.isMuted) {
      this.startBackgroundMusic();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Toca uma nota suave com decaimento tipo celesta/harpa
   */
  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainLevel: number = 0.15) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignora graciosamente em caso de bloqueio do SO
    }
  }

  /**
   * Efeito sonoro a cada casa percorrida pelo peão (som de passo mágico)
   */
  public playStepSound(stepNumber: number) {
    // Escala pentatônica mágica crescente
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
    const freq = notes[stepNumber % notes.length];
    this.playTone(freq, 0.22, 'sine', 0.12);
  }

  /**
   * Efeito sonoro do dado rolando
   */
  public playDiceRollSound() {
    if (this.isMuted) return;
    this.playTone(320, 0.08, 'triangle', 0.1);
    setTimeout(() => this.playTone(440, 0.08, 'triangle', 0.12), 70);
    setTimeout(() => this.playTone(560, 0.12, 'sine', 0.15), 140);
  }

  /**
   * Efeito sonoro de evento especial (unicórnio mágico)
   */
  public playSpecialEventSound() {
    if (this.isMuted) return;
    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    arpeggio.forEach((note, idx) => {
      setTimeout(() => this.playTone(note, 0.35, 'sine', 0.15), idx * 80);
    });
  }

  /**
   * Efeito sonoro de clique de câmera fotográfica (Casa 22)
   */
  public playCameraSound() {
    if (this.isMuted) return;
    this.playTone(800, 0.05, 'square', 0.1);
    setTimeout(() => this.playTone(1200, 0.08, 'sine', 0.12), 60);
  }

  /**
   * Fanfarra triunfal de vitória ao atingir a Chegada
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    const melody = [
      { note: 523.25, dur: 0.2, delay: 0 },
      { note: 659.25, dur: 0.2, delay: 200 },
      { note: 783.99, dur: 0.2, delay: 400 },
      { note: 1046.50, dur: 0.6, delay: 600 },
      { note: 880.00, dur: 0.2, delay: 900 },
      { note: 1046.50, dur: 0.8, delay: 1100 }
    ];
    melody.forEach(item => {
      setTimeout(() => this.playTone(item.note, item.dur, 'triangle', 0.25), item.delay);
    });
  }

  /**
   * Fundo musical suave e relaxante em loop procedimental (estilo caixinha de música de ninar)
   */
  public startBackgroundMusic() {
    if (this.isBgmPlaying || this.isMuted) return;
    this.isBgmPlaying = true;

    // Sequência suave de notas de harpa/caixinha de música
    const peacefulLullaby = [
      392.00, 440.00, 523.25, 659.25, // G4, A4, C5, E5
      587.33, 523.25, 440.00, 392.00  // D5, C5, A4, G4
    ];
    let noteIndex = 0;

    this.bgmInterval = window.setInterval(() => {
      if (!this.isMuted && this.isBgmPlaying) {
        const freq = peacefulLullaby[noteIndex % peacefulLullaby.length];
        this.playTone(freq, 1.2, 'sine', 0.04); // Volume bem sutil de fundo
        noteIndex++;
      }
    }, 1800);
  }

  public stopBackgroundMusic() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundService = new SoundService();
export default soundService;
