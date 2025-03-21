import React from 'react';
import { Cell as CellType } from '../types/types';

interface CellProps {
  cell: CellType;
  row: number;
  col: number;
  onClick: () => void;
  isCurrentPlayerTurn: boolean;
}

const Cell: React.FC<CellProps> = ({ cell, row, col, onClick, isCurrentPlayerTurn }) => {
  const handleClick = () => {
    if (!isCurrentPlayerTurn) return;
    if (cell.symbol || cell.isExcluded) return;
    onClick();
  };

  const getCellStyle = () => {
    const baseStyle: React.CSSProperties = {
      width: '60px',
      height: '60px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '1.8rem',
      cursor: !cell.symbol && !cell.isExcluded && isCurrentPlayerTurn ? 'pointer' : 'default',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '5px',
      transition: 'all 0.2s ease'
    };

    // If the cell is excluded
    if (cell.isExcluded) {
      return {
        ...baseStyle,
        backgroundColor: '#f5f5f5',
        opacity: 0.7,
        cursor: 'not-allowed'
      };
    }

    // If the cell has a bonus
    if (cell.hasBonus && cell.bonusType) {
      return {
        ...baseStyle,
        backgroundColor: '#fffacd', // Light yellow for bonus
        border: '1px dashed #ffa000'
      };
    }

    // If the cell has a symbol
    if (cell.symbol) {
      if (cell.symbolType === 'boosted') {
        return {
          ...baseStyle,
          border: '2px solid purple',
          boxShadow: '0 0 5px purple',
          backgroundColor: '#f3e5f5'
        };
      } else if (cell.symbolType === 'definitive') {
        return {
          ...baseStyle,
          border: '2px solid gold',
          backgroundColor: '#fffde7'
        };
      }
    }

    return baseStyle;
  };

  const renderBonusIndicator = () => {
    if (!cell.hasBonus || !cell.bonusType) return null;
    
    let bonusSymbol;
    switch (cell.bonusType) {
      case 'point':
        bonusSymbol = '+1';
        break;
      case 'removeOpponent':
        bonusSymbol = '✂️';
        break;
      case 'spread':
        bonusSymbol = '🌱';
        break;
      case 'boostedSymbol':
        bonusSymbol = '⭐';
        break;
      default:
        bonusSymbol = '?';
    }
    
    return (
      <div style={{ 
        position: 'absolute',
        top: '5px',
        right: '5px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {bonusSymbol}
      </div>
    );
  };

  return (
    <div 
      style={{
        ...getCellStyle(),
        position: 'relative'
      }}
      onClick={handleClick}
    >
      {cell.symbol}
      {cell.symbolType === 'definitive' && !cell.symbol && (
        <span style={{ fontSize: '0.8rem', position: 'absolute', top: '3px', right: '3px', fontWeight: 'bold' }}>D</span>
      )}
      {cell.symbolType === 'boosted' && !cell.symbol && (
        <span style={{ fontSize: '0.8rem', position: 'absolute', top: '3px', right: '3px', fontWeight: 'bold', color: 'purple' }}>B</span>
      )}
      {renderBonusIndicator()}
    </div>
  );
};

export default Cell; 