class WakeLockService {
  private sentinel: any = null;
  private isRequested: boolean = false;

  public async requestLock(): Promise<boolean> {
    this.isRequested = true;
    if ('wakeLock' in navigator) {
      try {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => {
          this.sentinel = null;
        });
        return true;
      } catch {
        // Dispositivo ou navegador recusou/não suportou
        return false;
      }
    }
    return false;
  }

  public releaseLock(): void {
    this.isRequested = false;
    if (this.sentinel) {
      this.sentinel.release().catch(() => {});
      this.sentinel = null;
    }
  }

  public initAutoReacquire(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isRequested) {
        this.requestLock().catch(() => {});
      }
    });
  }
}

export const wakeLockService = new WakeLockService();
export default wakeLockService;
