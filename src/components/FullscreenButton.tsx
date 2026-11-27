import React, { useState, useEffect } from 'react';

export const FullscreenButton: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    // Verifica suporte à Fullscreen API
    const supported = !!(
      document.fullscreenEnabled ||
      (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled
    );
    setIsSupported(supported);

    const handleFullscreenChange = () => {
      const active = !!(
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement
      );
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (!isSupported) return null;

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const el = document.documentElement as unknown as {
          requestFullscreen?: () => Promise<void>;
          webkitRequestFullscreen?: () => Promise<void>;
        };
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }
      } else {
        const doc = document as unknown as {
          exitFullscreen?: () => Promise<void>;
          webkitExitFullscreen?: () => Promise<void>;
        };
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch {
      // Falha silenciosa caso o navegador restrinja
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="p-2 bg-white/90 hover:bg-white rounded-xl shadow-md border border-pink-200 text-xs font-bold text-pink-600 transition-all active:scale-95 flex items-center justify-center"
      title={isFullscreen ? 'Sair da Tela Cheia' : 'Abrir em Tela Cheia (como App Instalado)'}
    >
      <span>{isFullscreen ? '🗗' : '⛶'}</span>
    </button>
  );
};

export default FullscreenButton;
