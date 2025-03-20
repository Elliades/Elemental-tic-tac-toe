import React from 'react';
import Cell from './Cell';
import { GameState, Position } from '../types/types';
import { GRID_SIZE } from '../config/gameConfig';

interface BoardProps {
  gameState: GameState;
  onCellClick: (position: Position) => void;
  currentPlayerId: string | null;
}

const Board: React.FC<BoardProps> = ({ gameState, onCellClick, currentPlayerId }) => {
  const { board, players, currentPlayerId: activePlayerId, gameOver } = gameState;
  
  const handleCellClick = (row: number, col: number) => {
    onCellClick({ row, col });
  };
  
  // Determine if it's the current player's turn
  const isCurrentPlayerTurn = currentPlayerId === activePlayerId && !gameOver;
  
  return (
    <div>
      {/* Player information and scores */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        marginBottom: '20px',
        alignItems: 'center'
      }}>
        {players.map((player, index) => (
          <div 
            key={player.id} 
            style={{ 
              padding: '10px 15px',
              backgroundColor: player.id === activePlayerId && !gameOver ? '#e3f2fd' : 'white',
              borderRadius: '5px',
              border: '1px solid #ccc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              minWidth: '120px'
            }}
          >
            <div style={{ fontSize: '2rem' }}>{player.symbol}</div>
            <div>{player.name}</div>
            <div style={{ fontWeight: 'bold' }}>Score: {player.score}</div>
            {player.id === activePlayerId && !gameOver && (
              <div style={{ 
                marginTop: '5px', 
                color: 'green', 
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Current Turn
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Game board */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gap: '5px',
        maxWidth: '650px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '5px'
      }}>
        {Array.from({ length: GRID_SIZE }).map((_, row) => (
          Array.from({ length: GRID_SIZE }).map((_, col) => (
            <Cell 
              key={`${row}-${col}`}
              cell={board[row][col]}
              row={row}
              col={col}
              onClick={() => handleCellClick(row, col)}
              isCurrentPlayerTurn={isCurrentPlayerTurn}
            />
          ))
        ))}
      </div>
    </div>
  );
};

export default Board; 