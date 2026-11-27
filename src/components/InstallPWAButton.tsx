import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [showQRWelcomeModal, setShowQRWelcomeModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  // Remove o parâmetro ?install=1 da barra de endereço sem recarregar a página
  const cleanInstallParam = () => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('install')) {
        url.searchParams.delete('install');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
      }
    } catch {
      // Ignora caso ambiente restrinja history
    }
  };

  useEffect(() => {
    // Verifica se já está rodando instalado como App (standalone)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();

    // Detecta se é dispositivo iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Detecta se acessou pelo link de QR Code com parâmetro de instalação (?install=1 ou ?install=true)
    const searchParams = new URLSearchParams(window.location.search);
    const hasInstallParam = searchParams.get('install') === '1' || searchParams.get('install') === 'true';

    if (hasInstallParam && !standalone) {
      if (isAppleDevice) {
        setShowIOSModal(true);
      } else {
        setShowQRWelcomeModal(true);
      }
    }

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
      setShowQRWelcomeModal(false);
      setShowIOSModal(false);
      cleanInstallParam();
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Se já estiver instalado e aberto como App, não precisa exibir o botão no cabeçalho
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    cleanInstallParam();
    setShowQRWelcomeModal(false);

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

  const handleDismissQRWelcome = () => {
    cleanInstallParam();
    setShowQRWelcomeModal(false);
  };

  const handleDismissIOSModal = () => {
    cleanInstallParam();
    setShowIOSModal(false);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg shadow-sm border border-emerald-300 text-[11px] sm:text-xs font-black transition-all active:scale-95 flex items-center gap-1 animate-pulse"
        title="Instalar o jogo no seu celular ou tablet para jogar sem internet"
      >
        <span>📲</span>
        <span className="hidden sm:inline">Instalar Jogo</span>
        <span className="sm:hidden">Instalar</span>
      </button>

      {/* Modal de Recepção de QR Code para Android / Desktop (1 Toque para Instalar) */}
      {showQRWelcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 select-none overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-sm w-full max-h-[92dvh] overflow-y-auto overscroll-contain my-auto text-center shadow-2xl border-4 border-pink-400 animate-scaleUp flex flex-col items-center">
            <div className="text-5xl mb-2 animate-bounce">🦄✨</div>
            <h3 className="text-xl font-black text-pink-600 mb-1 leading-tight">
              Cat no Reino dos Unicórnios
            </h3>
            <p className="text-xs font-bold text-purple-700 mb-4">
              Divirta-se no aniversário de 5 anos da Catarina
            </p>

            <div className="bg-pink-50 p-3.5 rounded-2xl border border-pink-200 text-xs text-gray-700 font-medium mb-5 text-left space-y-1.5 w-full">
              <p className="flex items-center gap-1.5 font-bold text-pink-700">
                <span>⭐</span> Instale no seu celular para:
              </p>
              <p className="flex items-center gap-1.5 text-gray-600">
                <span>📱</span> Jogar em tela cheia sem barras do navegador
              </p>
              <p className="flex items-center gap-1.5 text-gray-600">
                <span>📴</span> Funcionar 100% offline mesmo sem internet
              </p>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg border-2 border-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-2 mb-2 animate-pulse"
            >
              <span>📲</span>
              <span>Instalar Agora no Celular</span>
            </button>

            <button
              onClick={handleDismissQRWelcome}
              className="py-1.5 px-3 text-xs text-gray-400 hover:text-gray-600 font-bold transition-all"
            >
              Jogar pelo Navegador
            </button>
          </div>
        </div>
      )}

      {/* Modal explicativo para iPhone e iPad (iOS Safari) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 select-none overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full max-h-[92dvh] overflow-y-auto overscroll-contain my-auto text-center shadow-2xl border-4 border-pink-400 animate-scaleUp">
            <div className="text-4xl mb-1">📲✨</div>
            <h3 className="text-lg font-black text-pink-600 mb-0.5 leading-tight">
              Instalar no iPhone / iPad
            </h3>
            <p className="text-[11px] font-bold text-purple-700 mb-3">
              Divirta-se no aniversário de 5 anos da Catarina
            </p>

            <div className="text-left space-y-2.5 bg-pink-50 p-3 rounded-2xl border border-pink-200 text-xs text-gray-700 font-medium mb-4">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>Toque no botão <strong>Compartilhar</strong> (ícone ⎋ com seta para cima) na barra inferior do Safari.</span>
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
              onClick={handleDismissIOSModal}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs rounded-xl shadow-md active:scale-95"
            >
              Entendi / Continuar 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPWAButton;
