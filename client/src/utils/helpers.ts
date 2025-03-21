/**
 * Helper Utilities
 * 
 * This file contains common utility functions used throughout the application.
 */

import { v4 as uuidv4 } from 'uuid';
import { GameMode } from '../types/types';

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Generate a shareable game link
 * Ensures that the generated link will work across different browsers by
 * including the valid=true parameter which marks it as a valid game
 */
export const generateGameLink = (gameId: string, gameMode: string = '1v1'): string => {
  const baseUrl = window.location.origin;
  // Include both host=false (indicating joining) and valid=true (cross-browser validation token)
  const link = `${baseUrl}/#/lobby/${gameId}?mode=${gameMode}&valid=true&host=false`;
  console.log(`Generated game link: ${link}`);
  return link;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = (text: string): Promise<void> => {
  return navigator.clipboard.writeText(text)
    .then(() => {
      console.log('Text copied to clipboard');
    })
    .catch(err => {
      console.error('Could not copy text: ', err);
    });
}; 