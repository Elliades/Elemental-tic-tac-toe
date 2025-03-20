import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from './Board';
import { GameState, Position, Cell, BonusType } from '../types/types';
import { placeSymbol, checkGameOver } from '../core/gameLogic';
import { GRID_SIZE, BONUS_TYPES, SPREAD_LIMIT_PER_TURN } from '../config/gameConfig';
import { 
  onGameStateUpdate,
  updateGameState,
  getGameState,
  initSocket
} from '../services/gameService';

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBonusLegend, setShowBonusLegend] = useState<boolean>(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  
  // Get player ID from localStorage
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('currentPlayerId');
    if (storedPlayerId) {
      console.log(`Retrieved currentPlayerId from localStorage: ${storedPlayerId}`);
      setCurrentPlayerId(storedPlayerId);
    } else {
      console.error('No player ID found in localStorage');
      setError('Player ID not found. Please return to home and create a new game.');
    }
  }, []);

  // Set up real-time game state listener
  useEffect(() => {
    if (!gameId) {
      setError('Invalid game ID');
      setLoading(false);
      return;
    }

    console.log(`Game component initialized with gameId: ${gameId}`);
    
    // Initialize socket connection
    initSocket();
    
    // Load initial game state
    const loadInitialGameState = async () => {
      try {
        const initialState = await getGameState(gameId);
        console.log(`Loaded initial game state for ${gameId}`);
        if (initialState) {
          setGameState(initialState);
        } else {
          setError('Game not found or not started yet');
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load initial game state:', err);
        setError(`Failed to load game: ${(err as Error).message}`);
        setLoading(false);
      }
    };
    
    loadInitialGameState();

    // Set up real-time listener for game state changes
    onGameStateUpdate((updatedGameState) => {
      if (updatedGameState) {
        console.log(`Real-time update received for game ${gameId}`);
        setGameState(updatedGameState);
      }
    });

    return () => {
      // Socket disconnection is handled by the service elsewhere
    };
  }, [gameId]);

  const handleCellClick = useCallback(async (position: Position) => {
    if (!gameState || !currentPlayerId || !gameId) {
      console.log(`Can't handle click - gameState, currentPlayerId, or gameId is null`);
      return;
    }
    
    // Only allow the current player to make a move
    if (gameState.currentPlayerId !== currentPlayerId) {
      console.log(`Not your turn - current: ${gameState.currentPlayerId}, you: ${currentPlayerId}`);
      return;
    }
    
    if (gameState.gameOver) {
      console.log(`Game is already over`);
      return;
    }
    
    // Check if the cell is already occupied or excluded
    const cell = gameState.board[position.row][position.col];
    if (cell.symbol || cell.isExcluded) {
      console.log(`Cell at [${position.row},${position.col}] is already occupied or excluded`);
      return;
    }
    
    console.log(`Processing move at [${position.row},${position.col}] for player ${currentPlayerId}`);
    
    try {
      // Get the current player's symbol
      const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
      if (!currentPlayer) {
        console.error(`Player ${currentPlayerId} not found in game state`);
        return;
      }
      
      // Place the symbol and get the updated game state
      const updatedGameState = placeSymbol(gameState, position);
      
      // Update game state in the backend
      const response = await updateGameState(gameId, updatedGameState);
      if (response.success) {
        console.log(`Game state updated in backend after move`);
      } else {
        console.error(`Failed to update game state: ${response.error}`);
      }
    } catch (err) {
      console.error('Error during move:', err);
    }
  }, [gameState, currentPlayerId, gameId]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleStartNewGame = async () => {
    if (!gameState || !gameId) return;
    
    try {
      // Reset scores but keep the same players
      const updatedPlayers = gameState.players.map(player => ({
        ...player,
        score: 0
      }));
      
      // Create a new board
      const newBoard: Cell[][] = Array(GRID_SIZE).fill(0).map(() => 
        Array(GRID_SIZE).fill(0).map(() => ({ 
          symbol: null, 
          isExcluded: false,
          symbolType: null,
          playerId: null,
          hasBonus: false,
          bonusType: null,
          excludedUntilTurn: null
        }))
      );
      
      // Create a new game state
      const newGameState: GameState = {
        ...gameState,
        board: newBoard,
        players: updatedPlayers,
        currentPlayerIndex: 0,
        currentPlayerId: updatedPlayers[0].id,
        gameOver: false,
        winner: null,
        startTime: new Date().getTime(),
        spreadActivationsThisTurn: 0
      };
      
      // Update game state in the backend
      const response = await updateGameState(gameId, newGameState);
      if (response.success) {
        console.log(`New game started in backend`);
      } else {
        console.error(`Failed to start new game: ${response.error}`);
      }
    } catch (error) {
      console.error('Error starting new game:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '20px' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button 
          onClick={handleReturnHome}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Game not found</p>
      </div>
    );
  }

  // Determine if it's the current player's turn
  const isCurrentPlayerTurn = currentPlayerId === gameState.currentPlayerId;

  // Determine game status message
  let gameStatusMessage = '';
  if (gameState.gameOver && gameState.winner) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    gameStatusMessage = `Game Over! ${winner?.name || 'Player'} wins!`;
  } else if (isCurrentPlayerTurn) {
    gameStatusMessage = "It's your turn!";
  } else {
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    gameStatusMessage = `Waiting for ${currentPlayer?.name || 'opponent'} to play...`;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Primordial Elemental Tic-Tac-Toe</h1>
      
      <div style={{ 
        backgroundColor: isCurrentPlayerTurn ? '#e8f5e9' : '#f5f5f5', 
        padding: '10px 15px', 
        borderRadius: '5px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '1.2rem' }}>{gameStatusMessage}</p>
      </div>
      
      {/* Game board */}
      <Board 
        gameState={gameState} 
        onCellClick={handleCellClick} 
        currentPlayerId={currentPlayerId}
      />
      
      {/* Bonus legend toggle */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          onClick={() => setShowBonusLegend(!showBonusLegend)}
          style={{
            padding: '8px 15px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          {showBonusLegend ? 'Hide Bonus Legend' : 'Show Bonus Legend'}
        </button>
        
        {showBonusLegend && (
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '15px', 
            borderRadius: '5px',
            border: '1px solid #ddd',
            textAlign: 'left',
            marginTop: '10px'
          }}>
            <h3 style={{ marginTop: 0 }}>Bonus Types:</h3>
            <ul style={{ paddingLeft: '20px' }}>
              {Object.keys(BONUS_TYPES).map((type) => (
                <li key={type}>
                  <strong>{type}:</strong> {BONUS_TYPES[type as keyof typeof BONUS_TYPES].description}
                </li>
              ))}
            </ul>
            
            <h3>Symbols:</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Regular Symbol:</strong> Removed when part of an alignment</li>
              <li><strong>Definitive Symbol (D):</strong> Stays on the board after alignment</li>
              <li><strong>Boosted Symbol (B):</strong> Triggers additional spread when adjacent</li>
            </ul>
            
            <h3>Rules:</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>3-in-a-row:</strong> 1 point, 2 bonuses, 1 definitive symbol</li>
              <li><strong>4-in-a-row:</strong> 2 points, 3 bonuses, 1 boosted definitive symbol</li>
              <li><strong>5-in-a-row:</strong> 3 points, 2 boosted definitive symbols, 2 spread effects, exclusion zone</li>
              <li><strong>Spread Effect:</strong> Places additional symbols adjacent to existing ones (limited to {SPREAD_LIMIT_PER_TURN} per turn)</li>
              <li><strong>Exclusion Zone:</strong> Cells in a 5-in-a-row become blocked for several turns</li>
            </ul>
          </div>
        )}
      </div>
      
      {/* Game control buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={handleReturnHome}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Return to Home
        </button>
        
        {gameState.gameOver && (
          <button 
            onClick={handleStartNewGame}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Start New Game
          </button>
        )}
      </div>
    </div>
  );
};

export default Game; 