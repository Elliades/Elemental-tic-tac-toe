import { io, Socket } from 'socket.io-client';
import { GameState } from '../types/types';

// Configuration
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

// Socket.io instance
let socket: Socket;

// Callbacks for socket events
let playerUpdateCallback: ((players: any[]) => void) | null = null;
let gameStartCallback: ((data: { gameId: string, gameState: GameState }) => void) | null = null;
let gameStateUpdateCallback: ((gameState: GameState) => void) | null = null;

/**
 * Initialize socket connection
 */
export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL);
    
    socket.on('connect', () => {
      console.log('Connected to server with socket ID:', socket.id);
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    // Set up event listeners
    socket.on('playerUpdate', (players) => {
      console.log('Player update received:', players);
      if (playerUpdateCallback) playerUpdateCallback(players);
    });
    
    socket.on('gameStart', (data) => {
      console.log('Game start notification received');
      if (gameStartCallback) gameStartCallback(data);
    });
    
    socket.on('gameStateUpdate', (gameState) => {
      console.log('Game state update received');
      if (gameStateUpdateCallback) gameStateUpdateCallback(gameState);
    });
  }
  
  return socket;
};

/**
 * Register for player updates
 */
export const onPlayerUpdate = (callback: (players: any[]) => void) => {
  playerUpdateCallback = callback;
};

/**
 * Register for game start notifications
 */
export const onGameStart = (callback: (data: { gameId: string, gameState: GameState }) => void) => {
  gameStartCallback = callback;
};

/**
 * Register for game state updates
 */
export const onGameStateUpdate = (callback: (gameState: GameState) => void) => {
  gameStateUpdateCallback = callback;
};

/**
 * Join a game
 */
export const joinGame = (gameId: string, playerName: string): Promise<{ success: boolean, playerId?: string, isHost?: boolean, error?: string }> => {
  return new Promise((resolve) => {
    initSocket().emit('joinGame', { gameId, playerName }, (response: any) => {
      console.log(`Join game response:`, response);
      resolve(response);
    });
  });
};

/**
 * Start a game
 */
export const startGame = (gameId: string, gameState: GameState): Promise<{ success: boolean, error?: string }> => {
  return new Promise((resolve) => {
    initSocket().emit('startGame', { gameId, gameState }, (response: any) => {
      console.log(`Start game response:`, response);
      resolve(response);
    });
  });
};

/**
 * Update game state
 */
export const updateGameState = (gameId: string, gameState: GameState): Promise<{ success: boolean, error?: string }> => {
  return new Promise((resolve) => {
    initSocket().emit('updateGameState', { gameId, gameState }, (response: any) => {
      resolve(response);
    });
  });
};

/**
 * Get game info using REST API
 */
export const getGameInfo = async (gameId: string): Promise<any> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/games/${gameId}`);
    if (!response.ok) {
      throw new Error('Game not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting game info:', error);
    throw error;
  }
};

/**
 * Get game state using REST API
 */
export const getGameState = async (gameId: string): Promise<GameState | null> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/games/${gameId}/state`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to get game state');
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting game state:', error);
    throw error;
  }
};

/**
 * Create a new game using REST API
 */
export const createGame = async (creatorName: string): Promise<{ gameId: string, playerId: string }> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creatorName }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create game');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating game:', error);
    throw error;
  }
};

/**
 * Disconnect socket
 */
export const disconnect = () => {
  if (socket) {
    socket.disconnect();
  }
}; 