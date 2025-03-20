/**
 * Game Logic
 * 
 * This file contains the core game mechanics for Primordial Elemental Tic-Tac-Toe,
 * including functions for checking alignments, applying effects, and managing the game state.
 */

import { Cell, Position, Lineup, Player, GameState, BonusType, CellSymbolType } from '../types/types';
import {
  GRID_SIZE,
  MAX_SCORE,
  SCORE_DIFFERENCE_FOR_WIN,
  POINTS_FOR_THREE,
  POINTS_FOR_FOUR,
  POINTS_FOR_FIVE,
  MAX_DEFINITIVE_SYMBOLS,
  MAX_BOOSTED_SYMBOLS,
  BONUS_TYPES,
  ZONE_EXCLUSION_DURATION,
  SPREAD_LIMIT_PER_TURN
} from '../config/gameConfig';
import { spreadEffect } from './spreadEffect';

/**
 * Initialize an empty game board with the specified size
 */
export const initializeBoard = (): Cell[][] => {
  const board: Cell[][] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      board[row][col] = {
        symbol: null,
        symbolType: null,
        playerId: null,
        hasBonus: false,
        bonusType: null,
        isExcluded: false,
        excludedUntilTurn: null
      };
    }
  }
  
  return board;
};

/**
 * Initialize a new game state
 */
export const initializeGameState = (players: any[], gameMode: '1v1' | '1v1v1'): GameState => {
  // Transform player objects from Firebase if needed
  const gameStatePlayers = players.map((player, index) => {
    // If the player already has a symbol, use it; otherwise assign a new one
    if (player.symbol) {
      return player;
    }
    
    // Assign symbols based on player index
    const symbols = ['🔥', '💧', '💨', '🌍'];
    return {
      id: player.id,
      name: player.name || `Player ${index + 1}`,
      symbol: symbols[index % symbols.length],
      score: 0,
      definitiveSymbolsCount: 0,
      boostedSymbolsCount: 0
    };
  });
  
  return {
    board: initializeBoard(),
    players: gameStatePlayers,
    currentPlayerIndex: 0,
    currentPlayerId: gameStatePlayers[0].id,
    gameMode,
    winner: null,
    gameOver: false,
    startTime: new Date().getTime(),
    spreadActivationsThisTurn: 0
  };
};

/**
 * Check if a position is valid for a placement
 */
export const isValidPlacement = (
  state: GameState,
  position: Position
): boolean => {
  const { row, col } = position;
  
  // Check if position is within bounds
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
    return false;
  }
  
  const cell = state.board[row][col];
  
  // Check if cell is already occupied
  if (cell.symbol !== null) {
    return false;
  }
  
  // Check if cell is in an exclusion zone
  if (cell.isExcluded && cell.excludedUntilTurn !== null) {
    const currentTime = new Date().getTime();
    if (currentTime < cell.excludedUntilTurn) {
      return false;
    }
    // If exclusion has expired, clear it
    cell.isExcluded = false;
    cell.excludedUntilTurn = null;
  }
  
  return true;
};

/**
 * Place a symbol on the board
 */
export const placeSymbol = (
  state: GameState,
  position: Position
): GameState => {
  if (!isValidPlacement(state, position)) {
    return state;
  }
  
  const { row, col } = position;
  // Find the current player by ID instead of index
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer) {
    console.error(`Current player ID ${state.currentPlayerId} not found in players list`);
    return state;
  }
  
  const newBoard = [...state.board];
  
  // Create a deep copy of the cell
  const cell = { ...newBoard[row][col] };
  
  // Update cell with the current player's symbol
  cell.symbol = currentPlayer.symbol;
  cell.symbolType = 'normal';
  cell.playerId = currentPlayer.id;
  
  // Set the updated cell back to the board
  newBoard[row][col] = cell;
  
  // Apply any existing bonus on the cell
  let newState = {
    ...state,
    board: newBoard
  };
  
  if (cell.hasBonus && cell.bonusType) {
    newState = applyBonus(newState, cell.bonusType, position);
    
    // Clear the bonus after use
    newState.board[row][col].hasBonus = false;
    newState.board[row][col].bonusType = null;
  }
  
  // Process any lineups created by this placement
  newState = processLineups(newState, position);
  
  // Check for game over conditions
  newState = checkGameOver(newState);
  
  // Move to the next player's turn if the game is not over
  if (!newState.gameOver) {
    // Find the current player's index
    const currentIndex = newState.players.findIndex(p => p.id === state.currentPlayerId);
    if (currentIndex >= 0) {
      const nextPlayerIndex = (currentIndex + 1) % newState.players.length;
      newState.currentPlayerIndex = nextPlayerIndex;
      newState.currentPlayerId = newState.players[nextPlayerIndex].id;
    }
  }
  
  // Reset spread activations counter for next turn
  newState.spreadActivationsThisTurn = 0;
  
  return newState;
};

/**
 * Check for lineups in all directions
 */
export const findLineups = (state: GameState): Lineup[] => {
  const lineups: Lineup[] = [];
  
  // Check horizontal lineups
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 2; col++) {
      const cell = state.board[row][col];
      if (cell.symbol && cell.playerId) {
        let length = 1;
        let positions: Position[] = [{ row, col }];
        
        // Check consecutive symbols
        for (let i = 1; i < 5 && col + i < GRID_SIZE; i++) {
          const nextCell = state.board[row][col + i];
          if (nextCell.symbol === cell.symbol && nextCell.playerId === cell.playerId) {
            length++;
            positions.push({ row, col: col + i });
          } else {
            break;
          }
        }
        
        // Add lineup if length is at least 3
        if (length >= 3) {
          lineups.push({
            positions,
            length,
            playerId: cell.playerId
          });
          
          // Skip already processed cells
          col += length - 1;
        }
      }
    }
  }
  
  // Check vertical lineups
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE - 2; row++) {
      const cell = state.board[row][col];
      if (cell.symbol && cell.playerId) {
        let length = 1;
        let positions: Position[] = [{ row, col }];
        
        // Check consecutive symbols
        for (let i = 1; i < 5 && row + i < GRID_SIZE; i++) {
          const nextCell = state.board[row + i][col];
          if (nextCell.symbol === cell.symbol && nextCell.playerId === cell.playerId) {
            length++;
            positions.push({ row: row + i, col });
          } else {
            break;
          }
        }
        
        // Add lineup if length is at least 3
        if (length >= 3) {
          lineups.push({
            positions,
            length,
            playerId: cell.playerId
          });
          
          // Skip already processed cells
          row += length - 1;
        }
      }
    }
  }
  
  // Check diagonal lineups (top-left to bottom-right)
  for (let row = 0; row < GRID_SIZE - 2; row++) {
    for (let col = 0; col < GRID_SIZE - 2; col++) {
      const cell = state.board[row][col];
      if (cell.symbol && cell.playerId) {
        let length = 1;
        let positions: Position[] = [{ row, col }];
        
        // Check consecutive symbols
        for (let i = 1; i < 5 && row + i < GRID_SIZE && col + i < GRID_SIZE; i++) {
          const nextCell = state.board[row + i][col + i];
          if (nextCell.symbol === cell.symbol && nextCell.playerId === cell.playerId) {
            length++;
            positions.push({ row: row + i, col: col + i });
          } else {
            break;
          }
        }
        
        // Add lineup if length is at least 3
        if (length >= 3) {
          lineups.push({
            positions,
            length,
            playerId: cell.playerId
          });
        }
      }
    }
  }
  
  // Check diagonal lineups (top-right to bottom-left)
  for (let row = 0; row < GRID_SIZE - 2; row++) {
    for (let col = 2; col < GRID_SIZE; col++) {
      const cell = state.board[row][col];
      if (cell.symbol && cell.playerId) {
        let length = 1;
        let positions: Position[] = [{ row, col }];
        
        // Check consecutive symbols
        for (let i = 1; i < 5 && row + i < GRID_SIZE && col - i >= 0; i++) {
          const nextCell = state.board[row + i][col - i];
          if (nextCell.symbol === cell.symbol && nextCell.playerId === cell.playerId) {
            length++;
            positions.push({ row: row + i, col: col - i });
          } else {
            break;
          }
        }
        
        // Add lineup if length is at least 3
        if (length >= 3) {
          lineups.push({
            positions,
            length,
            playerId: cell.playerId
          });
        }
      }
    }
  }
  
  return lineups;
};

/**
 * Process all lineups in the current state
 */
export const processLineups = (state: GameState, lastPlacement: Position): GameState => {
  let newState = { ...state };
  let spreadCount = 0;
  let continueProcessing = true;
  
  while (continueProcessing) {
    const lineups = findLineups(newState);
    
    if (lineups.length === 0) {
      continueProcessing = false;
      continue;
    }
    
    // Process each lineup
    for (const lineup of lineups) {
      newState = processLineup(newState, lineup);
      
      // Check if we need to trigger the Spread effect for 5-in-a-row
      if (lineup.length === 5 && spreadCount < 2) {
        newState = spreadEffect(newState, lineup.playerId);
        spreadCount++;
      }
    }
  }
  
  return newState;
};

/**
 * Process a single lineup
 */
export const processLineup = (state: GameState, lineup: Lineup): GameState => {
  const newState = { ...state };
  const { length, playerId, positions } = lineup;
  
  // Award points based on lineup length
  let pointsToAward = 0;
  switch (length) {
    case 3:
      pointsToAward = POINTS_FOR_THREE;
      break;
    case 4:
      pointsToAward = POINTS_FOR_FOUR;
      break;
    case 5:
      pointsToAward = POINTS_FOR_FIVE;
      break;
  }
  
  // Add points to the player's score
  const playerIndex = newState.players.findIndex(player => player.id === playerId);
  if (playerIndex !== -1) {
    newState.players[playerIndex].score += pointsToAward;
  }
  
  // Copy the board for modification
  const newBoard = [...newState.board];
  
  // Process the consequences based on lineup length
  if (length === 3) {
    // 3-in-a-row: Remove symbols, place bonuses, and a definitive symbol
    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
    
    // First position gets a definitive symbol
    const defPos = shuffledPositions[0];
    newBoard[defPos.row][defPos.col] = {
      ...newBoard[defPos.row][defPos.col],
      symbol: newState.players[playerIndex].symbol,
      symbolType: 'definitive',
      playerId
    };
    
    // Next two positions get bonuses (if they're not definitive symbols already)
    for (let i = 1; i < 3; i++) {
      const bonusPos = shuffledPositions[i];
      const cell = newBoard[bonusPos.row][bonusPos.col];
      
      // Remove non-definitive symbols
      if (cell.symbolType !== 'definitive') {
        newBoard[bonusPos.row][bonusPos.col] = {
          ...createEmptyCell(),
          hasBonus: true,
          bonusType: getRandomBonusType()
        };
      }
    }
  } else if (length === 4) {
    // 4-in-a-row: Remove symbols, place bonuses, and a boosted definitive symbol
    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
    
    // First position gets a boosted definitive symbol
    const boostedPos = shuffledPositions[0];
    newBoard[boostedPos.row][boostedPos.col] = {
      ...newBoard[boostedPos.row][boostedPos.col],
      symbol: newState.players[playerIndex].symbol,
      symbolType: 'boosted',
      playerId
    };
    
    // Next three positions get bonuses (if they're not definitive symbols already)
    for (let i = 1; i < 4; i++) {
      const bonusPos = shuffledPositions[i];
      const cell = newBoard[bonusPos.row][bonusPos.col];
      
      // Remove non-definitive symbols
      if (cell.symbolType !== 'definitive') {
        newBoard[bonusPos.row][bonusPos.col] = {
          ...createEmptyCell(),
          hasBonus: true,
          bonusType: getRandomBonusType()
        };
      }
    }
  } else if (length === 5) {
    // 5-in-a-row: Remove symbols, place 2 boosted definitive symbols, activate exclusion zone
    const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);
    
    // First two positions get boosted definitive symbols
    for (let i = 0; i < 2; i++) {
      const boostedPos = shuffledPositions[i];
      newBoard[boostedPos.row][boostedPos.col] = {
        ...newBoard[boostedPos.row][boostedPos.col],
        symbol: newState.players[playerIndex].symbol,
        symbolType: 'boosted',
        playerId
      };
    }
    
    // Calculate exclusion duration in milliseconds
    const exclusionDuration = ZONE_EXCLUSION_DURATION * 1000; // Convert to milliseconds
    const exclusionEndTime = new Date().getTime() + exclusionDuration;
    
    // All positions become excluded zones
    for (const pos of positions) {
      const cell = newBoard[pos.row][pos.col];
      
      // Set exclusion zone (if not already occupied by a definitive symbol)
      if (cell.symbolType !== 'definitive' && cell.symbolType !== 'boosted') {
        newBoard[pos.row][pos.col] = {
          ...createEmptyCell(),
          isExcluded: true,
          excludedUntilTurn: exclusionEndTime
        };
      } else {
        // For positions with definitive symbols, just mark as excluded
        newBoard[pos.row][pos.col] = {
          ...cell,
          isExcluded: true,
          excludedUntilTurn: exclusionEndTime
        };
      }
    }
  }
  
  // Update the board in the state
  newState.board = newBoard;
  
  return newState;
};

/**
 * Apply a bonus effect
 */
export const applyBonus = (
  state: GameState,
  bonusType: BonusType,
  position: Position
): GameState => {
  var newState = { ...state };
  const { row, col } = position;
  const currentPlayer = state.players[state.currentPlayerIndex];
  
  switch (bonusType) {
    case 'point':
      // Award an immediate point
      const playerIndex = newState.players.findIndex(player => player.id === currentPlayer.id);
      if (playerIndex !== -1) {
        newState.players[playerIndex].score += 1;
      }
      break;
      
    case 'removeOpponent':
      // Remove a random opponent's symbol
      const opponents = newState.players.filter(player => player.id !== currentPlayer.id);
      if (opponents.length > 0) {
        const opponentSymbols: Position[] = [];
        
        // Find all opponent symbols
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            const cell = newState.board[r][c];
            if (
              cell.playerId && 
              cell.playerId !== currentPlayer.id && 
              cell.symbolType !== 'definitive' && 
              cell.symbolType !== 'boosted'
            ) {
              opponentSymbols.push({ row: r, col: c });
            }
          }
        }
        
        // Remove a random opponent symbol if any found
        if (opponentSymbols.length > 0) {
          const randomIndex = Math.floor(Math.random() * opponentSymbols.length);
          const randomPos = opponentSymbols[randomIndex];
          newState.board[randomPos.row][randomPos.col] = createEmptyCell();
        }
      }
      break;
      
    case 'spread':
      // Trigger an additional Spread effect
      newState = spreadEffect(newState, currentPlayer.id);
      break;
      
    case 'boostedSymbol':
      // Convert the current placement to a boosted symbol
      newState.board[row][col] = {
        ...newState.board[row][col],
        symbolType: 'boosted'
      };
      break;
  }
  
  return newState;
};

/**
 * Create an empty cell
 */
export const createEmptyCell = (): Cell => {
  return {
    symbol: null,
    symbolType: null,
    playerId: null,
    hasBonus: false,
    bonusType: null,
    isExcluded: false,
    excludedUntilTurn: null
  };
};

/**
 * Get a random bonus type based on probability distribution
 */
export const getRandomBonusType = (): BonusType => {
  const rand = Math.random();
  let cumulativeProbability = 0;
  
  // Check each bonus type against its probability
  for (const [type, data] of Object.entries(BONUS_TYPES)) {
    cumulativeProbability += data.probability;
    if (rand < cumulativeProbability) {
      return type.toLowerCase() as BonusType;
    }
  }
  
  // Default to 'point' if something goes wrong
  return 'point';
};

/**
 * Check if the game is over
 */
export const checkGameOver = (state: GameState): GameState => {
  const newState = { ...state };
  
  // Check if any player has reached or exceeded MAX_SCORE
  const highestScorePlayer = [...state.players].sort((a, b) => b.score - a.score)[0];
  
  if (highestScorePlayer.score >= MAX_SCORE) {
    // Get the second highest score
    const secondHighestScore = state.players.length > 1
      ? [...state.players].sort((a, b) => b.score - a.score)[1].score
      : 0;
      
    // Check if the score difference is sufficient to win
    if (highestScorePlayer.score - secondHighestScore >= SCORE_DIFFERENCE_FOR_WIN) {
      newState.winner = highestScorePlayer.id;
      newState.gameOver = true;
    }
  }
  
  // Check if the entire board is filled or blocked
  let hasAvailableMoves = false;
  for (let row = 0; row < GRID_SIZE && !hasAvailableMoves; row++) {
    for (let col = 0; col < GRID_SIZE && !hasAvailableMoves; col++) {
      if (isValidPlacement(state, { row, col })) {
        hasAvailableMoves = true;
        break;
      }
    }
  }
  
  // If no available moves and no winner yet, the game is a draw
  if (!hasAvailableMoves && !newState.winner) {
    // Determine winner based on the highest score
    newState.winner = highestScorePlayer.id;
    newState.gameOver = true;
  }
  
  return newState;
};

/**
 * Apply the Spread effect
 */
export const applySpreadEffect = (state: GameState, playerId: number): GameState => {
  const { board, players } = state;
  const playerSymbol = players[playerId].symbol;
  
  // Find all cells with the player's symbol
  const playerCells: Position[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col].symbol === playerSymbol) {
        playerCells.push({ row, col });
      }
    }
  }
  
  if (playerCells.length === 0) return state;
  
  // Find all adjacent free cells
  const adjacentFreeCells: Position[] = [];
  
  playerCells.forEach(cell => {
    // Check all 8 adjacent cells
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue; // Skip the cell itself
        
        const newRow = cell.row + dr;
        const newCol = cell.col + dc;
        
        // Check if valid position within the grid
        if (
          newRow >= 0 && newRow < GRID_SIZE && 
          newCol >= 0 && newCol < GRID_SIZE &&
          !board[newRow][newCol].symbol &&
          !board[newRow][newCol].isExcluded
        ) {
          adjacentFreeCells.push({ row: newRow, col: newCol });
        }
      }
    }
  });
  
  // If no adjacent free cells, pick any free cell that's not excluded
  let targetPosition: Position | null = null;
  
  if (adjacentFreeCells.length > 0) {
    // Choose a random adjacent free cell
    targetPosition = adjacentFreeCells[Math.floor(Math.random() * adjacentFreeCells.length)];
  } else {
    // Find any free cell that's not excluded
    const freeCells: Position[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!board[row][col].symbol && !board[row][col].isExcluded) {
          freeCells.push({ row, col });
        }
      }
    }
    
    if (freeCells.length > 0) {
      targetPosition = freeCells[Math.floor(Math.random() * freeCells.length)];
    }
  }
  
  // If we found a valid position, place the symbol
  if (targetPosition) {
    const { row, col } = targetPosition;
    board[row][col].symbol = playerSymbol;
    state.spreadActivationsThisTurn++;
    
    // Check for boosted symbols interaction
    checkBoostedInteraction(state, targetPosition, playerId);
  }
  
  return state;
};

/**
 * Check for interactions with boosted symbols
 */
export const checkBoostedInteraction = (state: GameState, position: Position, playerId: number): GameState => {
  const { board, players } = state;
  const { row, col } = position;
  const playerSymbol = players[playerId].symbol;
  
  // Check all 8 adjacent cells for boosted symbols
  let hasBoostedAdjacent = false;
  
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue; // Skip the cell itself
      
      const newRow = row + dr;
      const newCol = col + dc;
      
      // Check if valid position within the grid
      if (
        newRow >= 0 && newRow < GRID_SIZE && 
        newCol >= 0 && newCol < GRID_SIZE &&
        board[newRow][newCol].symbol === playerSymbol &&
        board[newRow][newCol].symbolType === 'boosted'
      ) {
        hasBoostedAdjacent = true;
        break;
      }
    }
    if (hasBoostedAdjacent) break;
  }
  
  // If adjacent to a boosted symbol, place an additional symbol
  if (hasBoostedAdjacent && state.spreadActivationsThisTurn < SPREAD_LIMIT_PER_TURN) {
    applySpreadEffect(state, playerId);
  }
  
  return state;
}; 