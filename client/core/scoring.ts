/**
 * Scoring System
 * 
 * This file contains functions related to calculating and managing scores
 * in the Primordial Elemental Tic-Tac-Toe game.
 */

import { GameState, Player } from '../types/types';
import { MAX_SCORE, SCORE_DIFFERENCE_FOR_WIN } from '../config/gameConfig';

/**
 * Add points to a player's score
 */
export const addPoints = (
  state: GameState,
  playerId: string,
  points: number
): GameState => {
  const newState = { ...state };
  const playerIndex = newState.players.findIndex(player => player.id === playerId);
  
  if (playerIndex !== -1) {
    const updatedPlayers = [...newState.players];
    updatedPlayers[playerIndex] = {
      ...updatedPlayers[playerIndex],
      score: updatedPlayers[playerIndex].score + points
    };
    
    newState.players = updatedPlayers;
  }
  
  return newState;
};

/**
 * Check if the score difference is enough for a win
 */
export const checkScoreDifferenceForWin = (state: GameState): boolean => {
  // Sort players by score (descending)
  const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  
  // If we have at least 2 players and the highest score is at least MAX_SCORE
  if (sortedPlayers.length >= 2 && sortedPlayers[0].score >= MAX_SCORE) {
    // Check the score difference between the highest and second highest
    const scoreDifference = sortedPlayers[0].score - sortedPlayers[1].score;
    return scoreDifference >= SCORE_DIFFERENCE_FOR_WIN;
  }
  
  return false;
};

/**
 * Get the player with the highest score
 */
export const getHighestScoringPlayer = (state: GameState): Player | null => {
  if (state.players.length === 0) {
    return null;
  }
  
  return [...state.players].sort((a, b) => b.score - a.score)[0];
};

/**
 * Get the current scores as a formatted string
 */
export const getScoresAsString = (state: GameState): string => {
  return state.players
    .map(player => `${player.name} (${player.symbol}): ${player.score}`)
    .join(' | ');
}; 