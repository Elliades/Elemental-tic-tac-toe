/**
 * Game Configuration
 * 
 * This file contains all configurable parameters for the Primordial Elemental Tic-Tac-Toe game.
 * Any changes to game mechanics should be made here to ensure consistency across the application.
 */

// Board configuration
export const GRID_SIZE = 9; // Default 9x9 grid

// Scoring thresholds
export const MAX_SCORE = 12; // Score threshold that triggers game-end checks
export const SCORE_DIFFERENCE_FOR_WIN = 5; // Minimum score gap required for victory

// Points awarded for alignments
export const POINTS_FOR_THREE = 1; // Points for 3-in-a-row
export const POINTS_FOR_FOUR = 2; // Points for 4-in-a-row
export const POINTS_FOR_FIVE = 3; // Points for 5-in-a-row

// Player symbols
export const SYMBOLS = ["🔥", "💧", "💨", "🌍"]; // Fire, Water, Air, Earth

// Symbol limits per player
export const MAX_DEFINITIVE_SYMBOLS = 10; // Maximum definitive symbols per player
export const MAX_BOOSTED_SYMBOLS = 5; // Maximum boosted symbols per player

// Spread effect configuration
export const SPREAD_LIMIT_PER_TURN = 5; // Maximum number of successive Spread activations in one turn

// Bonus configuration
export const BONUS_TYPES = {
  POINT: {
    id: 'POINT',
    symbol: '+1',
    description: 'Gain 1 additional point immediately',
    probability: 0.50
  },
  REMOVE_OPPONENT: {
    id: 'REMOVE_OPPONENT',
    symbol: '✂️',
    description: 'Remove an opponent\'s non-definitive symbol',
    probability: 0.30
  },
  SPREAD: {
    id: 'SPREAD',
    symbol: '🌱',
    description: 'Place an extra symbol adjacent to one of yours',
    probability: 0.15
  },
  BOOSTED_SYMBOL: {
    id: 'BOOSTED_SYMBOL',
    symbol: '⭐',
    description: 'Your symbol becomes boosted, generating additional effects',
    probability: 0.05
  }
};

// Exclusion zone configuration
export const ZONE_EXCLUSION_DURATION = 3; // Number of turns a 5-in-a-row zone is blocked

// Game modes
export const GAME_MODES = {
  ONE_VS_ONE: "1v1",
  ONE_VS_ONE_VS_ONE: "1v1v1"
};

// Game version
export const GAME_VERSION = "1.0.0"; 