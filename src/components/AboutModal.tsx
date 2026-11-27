import React from 'react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 select-none overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[92dvh] overflow-y-auto overscroll-contain my-auto shadow-2xl border-4 border-pink-300 flex flex-col items-center animate-scaleUp text-center relative">
        {/* Botão de Fechar no Canto Superior Direito */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold flex items-center justify-center transition-all active:scale-95 text-sm"
          title="Fechar"
        >
          ✖
        </button>

        {/* Foto do Vovô Nilton */}
        <div className="relative mb-3 mt-1">
          <img
            src="/assets/vovo.jpeg"
            alt="Vovô Nilton"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-pink-400 shadow-lg ring-4 ring-pink-100"
          />
          <div className="absolute -bottom-1 -right-1 text-2xl animate-bounce">
            💖
          </div>
        </div>

        {/* Título e Apresentação Afetiva */}
        <h2 className="text-lg sm:text-2xl font-black text-pink-600 leading-tight">
          Cat no Reino dos Unicórnios
        </h2>
        <p className="text-xs sm:text-sm font-bold text-purple-700 mb-3">
          Presente especial de aniversário para a Catarina ✨
        </p>

        {/* História / Sobre */}
        <div className="bg-pink-50 p-3.5 rounded-2xl border border-pink-200 text-xs text-gray-700 font-medium mb-3 text-left space-y-1.5 w-full leading-relaxed">
          <p className="font-bold text-pink-800 flex items-center gap-1.5 text-xs sm:text-sm">
            <span>🎁</span> Um Presente de Aniversário
          </p>
          <p>
            Este jogo foi idealizado, programado e construído com todo o carinho do mundo pelo <strong>Vovô Nilton</strong> especialmente para comemorar o aniversário de <strong>5 anos da Catarina</strong>.
          </p>
        </div>

        {/* Termos de Uso Lúdicos */}
        <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 text-xs text-gray-700 font-medium mb-3 text-left space-y-1.5 w-full leading-relaxed">
          <p className="font-bold text-purple-800 flex items-center gap-1.5 text-xs sm:text-sm">
            <span>📜</span> Termos de Uso & Diversão
          </p>
          <p>
            A única regra obrigatória para jogar é dar muitas risadas, torcer pelo seu unicórnio e se divertir com a família e os amigos!
          </p>
          <p>
            🦄 <strong>Direito de Imagem:</strong> Todos os unicórnios deste reino concordaram oficialmente com o uso das suas imagens em troca de muito carinho, doces e glitter.
          </p>
        </div>

        {/* Privacidade */}
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-gray-700 font-medium mb-4 text-left space-y-1 w-full leading-relaxed">
          <p className="font-bold text-amber-800 flex items-center gap-1.5 text-xs sm:text-sm">
            <span>🔒</span> Privacidade Mágica
          </p>
          <p>
            Zero coleta de dados, zero anúncios e zero rastreamento. O jogo funciona 100% no seu aparelho e offline. O único segredo guardado aqui é a magia da Tecnologia usada pelo Vovô para ver a Catarina Feliz.
          </p>
        </div>

        {/* Botão de Retorno ao Jogo */}
        <button
          onClick={onClose}
          className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg border border-pink-300 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Voltar para a Aventura!</span>
          <span>🌈</span>
        </button>
      </div>
    </div>
  );
};

export default AboutModal;
