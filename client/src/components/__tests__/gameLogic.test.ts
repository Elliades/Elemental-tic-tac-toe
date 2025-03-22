import { initializeGameState } from '../../core/gameLogic';

describe('Game Logic', () => {
  describe('initializeGameState', () => {
    it('should initialize a game state for 1v1 mode', () => {
      const players = [
        { id: 'player1', name: 'Player 1' },
        { id: 'player2', name: 'Player 2' }
      ];
      
      const gameState = initializeGameState(players, '1v1');
      
      expect(gameState).toBeDefined();
      expect(gameState.players).toHaveLength(2);
      expect(gameState.currentPlayerIndex).toBe(0);
      expect(gameState.gameOver).toBe(false);
    });
  });
});
