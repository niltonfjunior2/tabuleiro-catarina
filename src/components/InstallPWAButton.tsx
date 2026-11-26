import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Verifica se já está rodando instalado como App (standalone)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Detecta se é dispositivo iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Captura o evento nativo de instalação do PWA (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Ouve quando o app é instalado com sucesso
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Se já estiver instalado e aberto como App, não precisa exibir
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Dispara o prompt nativo de instalação do navegador
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // No iOS Safari não há API beforeinstallprompt, abre instrução amigável
      setShowIOSModal(true);
    } else {
      // Caso o navegador não tenha disparado o prompt ainda, mostra dica
      alert('Para instalar: toque no menu de opções do seu navegador (⋮) e escolha "Instalar aplicativo" ou "Adicionar à tela inicial".');
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="px-2.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-md border border-emerald-300 text-xs font-black transition-all active:scale-95 flex items-center gap-1.5 animate-pulse"
        title="Instalar o jogo no seu celular ou tablet para jogar sem internet"
      >
        <span>📲</span>
        <span className="hidden sm:inline">Instalar Jogo</span>
        <span className="sm:hidden">Instalar</span>
      </button>

      {/* Modal explicativo para iPhone e iPad (iOS Safari) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-4 border-pink-300 animate-scaleUp">
            <div className="text-4xl mb-2">📲✨</div>
            <h3 className="text-lg font-black text-pink-600 mb-2">
              Como Instalar no iPhone ou iPad:
            </h3>

            <div className="text-left space-y-3 bg-pink-50/70 p-3 rounded-2xl border border-pink-200 text-xs text-gray-700 font-medium mb-4">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima ⎋) na barra do Safari.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> (ícone ➕).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <span>Toque em <strong>"Adicionar"</strong> no canto superior direito. Pronto!</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs rounded-xl shadow-md active:scale-95"
            >
              Entendi! 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWAButton;
