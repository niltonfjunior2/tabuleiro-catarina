import React from 'react';
import { Player, BoardCoordinate } from '../core/types';
import { calculateTileOffsets } from '../core/engine';
import { PlayerToken } from './PlayerToken';
import coordinatesData from '../data/board-coordinates.json';

interface BoardViewProps {
  players: Player[];
  activePlayerIndex: number;
}

export const BoardView: React.FC<BoardViewProps> = ({
  players,
  activePlayerIndex
}) => {
  const coordinates = coordinatesData as BoardCoordinate[];
  const coordMap = new Map<number, BoardCoordinate>();
  coordinates.forEach(c => coordMap.set(c.tileNumber, c));

  return (
    <div className="relative w-full h-full flex items-center justify-center p-0.5 sm:p-1 box-border overflow-hidden bg-pink-100">
      {/* Container com Aspect Ratio estrito 3543:2480 adaptado dinamicamente para nunca vazar nem cortar */}
      <div 
        className="relative aspect-[3543/2480] shadow-2xl rounded-2xl overflow-hidden border-2 border-pink-300 bg-white flex items-center justify-center max-h-full max-w-full"
        style={{
          aspectRatio: '3543 / 2480',
          width: 'auto',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        {/* Imagem de Fundo Oficial em WebP Retina com contain para visibilidade integral */}
        <img
          src="/assets/tabuleiro.webp"
          alt="Tabuleiro Catarina 5 Anos"
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {/* Renderização dos Peões dos Jogadores */}
        {players.map((player, index) => {
          const coord = coordMap.get(player.currentPosition) || {
            tileNumber: player.currentPosition,
            xPercent: 6.8,
            yPercent: 87.5
          };

          const offsets = calculateTileOffsets(players, player.currentPosition);
          const offset = offsets.get(player.id);

          return (
            <PlayerToken
              key={player.id}
              player={player}
              isActive={index === activePlayerIndex}
              xPercent={coord.xPercent}
              yPercent={coord.yPercent}
              offset={offset}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BoardView;
