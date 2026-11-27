import React, { useState } from 'react';
import { soundService } from '../services/soundService';

export const AudioControl: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());

  const handleToggle = () => {
    soundService.unlock();
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-1 sm:p-1.5 rounded-lg shadow-sm border transition-all active:scale-95 flex items-center justify-center text-xs font-bold ${
        isMuted
          ? 'bg-gray-100 text-gray-500 border-gray-300'
          : 'bg-white text-pink-600 border-pink-300 ring-1 ring-pink-200 animate-pulse'
      }`}
      title={isMuted ? 'Ligar Fundo Musical e Sons' : 'Silenciar Sons'}
    >
      <span>{isMuted ? '🔇' : '🎵'}</span>
    </button>
  );
};

export default AudioControl;
