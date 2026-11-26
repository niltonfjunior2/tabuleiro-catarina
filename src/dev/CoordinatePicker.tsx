import React, { useState } from 'react';
import { BoardCoordinate } from '../core/types';

interface CoordinatePickerProps {
  imageSrc?: string;
}

export const CoordinatePicker: React.FC<CoordinatePickerProps> = ({ 
  imageSrc = '/assets/tabuleiro.webp' 
}) => {
  const [coords, setCoords] = useState<BoardCoordinate[]>([]);
  const [currentTile, setCurrentTile] = useState<number>(0);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newCoord: BoardCoordinate = {
      tileNumber: currentTile,
      xPercent: parseFloat(x.toFixed(2)),
      yPercent: parseFloat(y.toFixed(2))
    };

    setCoords(prev => [...prev.filter(c => c.tileNumber !== currentTile), newCoord]);
    setCurrentTile(prev => (prev < 52 ? prev + 1 : 52));
  };

  const copyToClipboard = () => {
    const sorted = [...coords].sort((a, b) => a.tileNumber - b.tileNumber);
    navigator.clipboard.writeText(JSON.stringify(sorted, null, 2));
    alert('Coordenadas copiadas para a área de transferência em formato JSON!');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-2 overflow-hidden text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-gray-700">
        <div>
          <span className="font-bold text-pink-400">Dev Tool: Coordinate Picker</span>
          <span className="ml-3">
            Próxima Casa a Calibrar: <strong className="text-yellow-300 text-sm">#{currentTile}</strong> 
            {currentTile === 0 ? ' (LARGADA)' : currentTile === 52 ? ' (CHEGADA)' : ''}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentTile(Math.max(0, currentTile - 1))}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            ← Voltar
          </button>
          <button 
            onClick={() => setCurrentTile(Math.min(52, currentTile + 1))}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Avançar →
          </button>
          <button 
            onClick={copyToClipboard}
            className="px-3 py-1 bg-pink-600 hover:bg-pink-500 font-bold rounded"
          >
            Copiar JSON ({coords.length}/53)
          </button>
        </div>
      </div>

      <div 
        className="relative flex-1 cursor-crosshair overflow-hidden mt-2 border border-gray-700 select-none flex items-center justify-center bg-black"
        onClick={handleImageClick}
      >
        <img 
          src={imageSrc} 
          alt="Tabuleiro para calibração" 
          className="max-h-full max-w-full object-contain pointer-events-none"
        />

        {coords.map(coord => (
          <div
            key={coord.tileNumber}
            style={{ left: `${coord.xPercent}%`, top: `${coord.yPercent}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-pink-500 border border-white text-white flex items-center justify-center text-[10px] font-bold shadow-md pointer-events-none"
          >
            {coord.tileNumber}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoordinatePicker;
