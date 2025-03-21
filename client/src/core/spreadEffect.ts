/**
 * Spread Effect
 * 
 * This file contains the logic for the Spread effect in Primordial Elemental Tic-Tac-Toe.
 * The Spread effect places a symbol (of the player who initiated the effect) on a free adjacent square.
 */

import { Cell, GameState, Position } from '../types/types';
import { GRID_SIZE, SPREAD_LIMIT_PER_TURN } from '../config/gameConfig';
import { createEmptyCell } from './gameLogic';

/**
 * Apply the spread effect for a player
 */
export const spreadEffect = (state: GameState, playerId: string): GameState => {
  const newState = { ...state };
  const player = newState.players.find(p => p.id === playerId);
  
  if (!player) {
    return newState;
  }
  
  // Find all existing symbols of the player
  const playerSymbols: Position[] = [];
  const boostedSymbols: Position[] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = newState.board[row][col];
      if (cell.playerId === playerId && cell.symbol) {
        playerSymbols.push({ row, col });
        
        // Track boosted symbols separately
        if (cell.symbolType === 'boosted') {
          boostedSymbols.push({ row, col });
        }
      }
    }
  }
  
  if (playerSymbols.length === 0) {
    return newState;
  }
  
  // Find adjacent free cells to player's symbols
  const adjacentFreeCells: Position[] = [];
  
  for (const symbolPos of playerSymbols) {
    const { row, col } = symbolPos;
    
    // Check all 8 adjacent positions
    const adjacentPositions = [
      { row: row - 1, col: col - 1 },
      { row: row - 1, col },
      { row: row - 1, col: col + 1 },
      { row, col: col - 1 },
      { row, col: col + 1 },
      { row: row + 1, col: col - 1 },
      { row: row + 1, col },
      { row: row + 1, col: col + 1 }
    ];
    
    for (const pos of adjacentPositions) {
      if (
        pos.row >= 0 && pos.row < GRID_SIZE &&
        pos.col >= 0 && pos.col < GRID_SIZE
      ) {
        const cell = newState.board[pos.row][pos.col];
        
        // Check if the cell is free (no symbol and not excluded)
        if (
          cell.symbol === null &&
          (!cell.isExcluded || (cell.excludedUntilTurn !== null && cell.excludedUntilTurn <= new Date().getTime()))
        ) {
          adjacentFreeCells.push(pos);
        }
      }
    }
  }
  
  // If no adjacent free cells, find a random free cell on the board
  let targetPositions: Position[] = [];
  
  if (adjacentFreeCells.length > 0) {
    targetPositions = adjacentFreeCells;
  } else {
    // Find all free cells on the board
    const freeCells: Position[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = newState.board[row][col];
        if (
          cell.symbol === null &&
          (!cell.isExcluded || (cell.excludedUntilTurn !== null && cell.excludedUntilTurn <= new Date().getTime()))
        ) {
          freeCells.push({ row, col });
        }
      }
    }
    
    targetPositions = freeCells;
  }
  
  // If no valid positions found, return the original state
  if (targetPositions.length === 0) {
    return newState;
  }
  
  // Randomly choose a position
  const randomIndex = Math.floor(Math.random() * targetPositions.length);
  const targetPos = targetPositions[randomIndex];
  
  // Place the player's symbol at the target position
  const newBoard = [...newState.board];
  newBoard[targetPos.row][targetPos.col] = {
    ...createEmptyCell(),
    symbol: player.symbol,
    symbolType: 'normal',
    playerId: player.id
  };
  
  newState.board = newBoard;
  
  // Check for boosted symbol interactions
  if (boostedSymbols.length > 0) {
    // Check if the newly placed symbol is adjacent to any boosted symbol
    let isAdjacentToBoosted = false;
    
    for (const boostedPos of boostedSymbols) {
      const { row, col } = boostedPos;
      
      // Calculate the distance between the new symbol and the boosted symbol
      const rowDiff = Math.abs(targetPos.row - row);
      const colDiff = Math.abs(targetPos.col - col);
      
      // If the distance is 1 or less in both dimensions, they are adjacent
      if (rowDiff <= 1 && colDiff <= 1) {
        isAdjacentToBoosted = true;
        break;
      }
    }
    
    // If adjacent to a boosted symbol, trigger an additional spread
    if (isAdjacentToBoosted) {
      // Avoid infinite recursion by limiting the number of spread effects
      const spreadCount = (newState as any).spreadCount || 0;
      
      if (spreadCount < SPREAD_LIMIT_PER_TURN) {
        // Track the number of spread effects triggered in this turn
        const stateWithCount = {
          ...newState,
          spreadCount: spreadCount + 1
        };
        
        // Recursively trigger another spread effect
        return spreadEffect(stateWithCount, playerId);
      }
    }
  }
  
  return newState;
}; 