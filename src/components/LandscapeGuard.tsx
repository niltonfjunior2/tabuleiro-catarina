import React, { useEffect, useState } from 'react';

export const LandscapeGuard: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Verifica proporção da janela ou API de orientação
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-50 bg-pink-600 text-white flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      <div className="w-24 h-24 mb-6 rounded-2xl border-4 border-white flex items-center justify-center animate-bounce shadow-2xl bg-pink-500">
        <span className="text-5xl transform rotate-90">📱</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-black mb-2 text-yellow-300 drop-shadow">
        Gire o aparelho de lado!
      </h2>
      <p className="text-base md:text-lg max-w-sm text-pink-100 font-medium">
        Para entrar no mundo mágico de <strong>Cat no Reino dos Unicórnios</strong>, por favor utilize seu celular ou tablet no <strong>Modo Paisagem (Horizontal)</strong>.
      </p>
    </div>
  );
};

export default LandscapeGuard;
