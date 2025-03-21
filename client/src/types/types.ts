/**
 * Game Types and Interfaces
 * 
 * This file defines all types and interfaces used throughout the Primordial Elemental Tic-Tac-Toe game.
 */

// Player type
export interface Player {
  id: string;
  name: string;
  symbol: string;
  score: number;
}

// Cell content types
export type CellSymbolType = 'normal' | 'definitive' | 'boosted';

// Cell interface
export interface Cell {
  symbol: string | null;
  symbolType: CellSymbolType | null;
  playerId: string | null;
  hasBonus: boolean;
  bonusType: BonusType | null;
  isExcluded: boolean;
  excludedUntilTurn: number | null;
}

// Bonus types
export type BonusType = 'point' | 'removeOpponent' | 'spread' | 'boostedSymbol';

// Position interface
export interface Position {
  row: number;
  col: number;
}

// Lineup interface (for tracking alignments)
export interface Lineup {
  positions: Position[];
  length: number;
  playerId: string;
}

// Game modes
export type GameMode = '1v1' | '1v1v1';

// Game state
export interface GameState {
  gameId?: string;
  gameMode: GameMode;
  board: Cell[][];
  players: Player[];
  currentPlayerIndex: number;
  currentPlayerId: string;
  winner: string | null;
  gameOver: boolean;
  startTime: number;
  spreadActivationsThisTurn: number;
  lastUpdated?: number;
}

// Game action types
export enum GameActionType {
  PLACE_SYMBOL = 'PLACE_SYMBOL',
  APPLY_BONUS = 'APPLY_BONUS',
  APPLY_SPREAD = 'APPLY_SPREAD',
  ADD_SCORE = 'ADD_SCORE',
  NEXT_TURN = 'NEXT_TURN',
  GAME_OVER = 'GAME_OVER',
  RESET_GAME = 'RESET_GAME',
}

export interface CellType {
  symbol: string | null;
  symbolType: 'normal' | 'definitive' | 'boosted' | null;
  playerId: string | null;
  hasBonus: boolean;
  bonusType: string | null;
  isExcluded: boolean;
  excludedUntilTurn: number | null; // Timestamp in milliseconds when exclusion ends
} 