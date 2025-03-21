import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { generateGameLink, copyToClipboard } from '../utils/helpers';
import { GameMode, GameState } from '../types/types';
import { initializeGameState } from '../core/gameLogic';
import { 
  joinGame, 
  initSocket,
  onPlayerUpdate,
  onGameStart,
  startGame as startBackendGame
} from '../services/gameService';

const Lobby: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const gameMode = queryParams.get('mode') as GameMode || '1v1';
  const isHost = queryParams.get('host') === 'true';
  const isValidLink = queryParams.get('valid') === 'true';
  
  const [connectedPlayers, setConnectedPlayers] = useState<any[]>([]);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Use useRef to ensure initialization only happens once
  const isInitialized = useRef(false);
  
  // Number of players needed based on game mode
  const requiredPlayers = gameMode === '1v1' ? 2 : 3;
  
  useEffect(() => {
    // Guard against missing gameId
    if (!gameId) {
      console.error("Game ID is missing");
      setError("Game ID is missing");
      setIsLoading(false);
      return;
    }
    
    // Prevent multiple initializations
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    console.log(`Lobby opened with gameId: ${gameId}, mode: ${gameMode}, isHost: ${isHost}, validLink: ${isValidLink}`);
    
    // Initialize socket connection
    initSocket();
    
    // Initialize player and join the game
    const initializePlayerAndJoinGame = async () => {
      try {
        setIsLoading(true);
        
        // Get player name from localStorage or generate a default one
        const storedName = localStorage.getItem('playerName') || `Player ${Math.floor(Math.random() * 1000)}`;
        setPlayerName(storedName);
        localStorage.setItem('playerName', storedName);
        
        // Join the game using the socket service
        const response = await joinGame(gameId, storedName);
        if (!response.success) {
          throw new Error(response.error || 'Failed to join game');
        }
        
        const newPlayerId = response.playerId as string;
        setPlayerId(newPlayerId);
        
        // Store current player ID in localStorage
        localStorage.setItem('currentPlayerId', newPlayerId);
        
        console.log(`Joined game as: ${storedName} with ID: ${newPlayerId}`);
        setIsLoading(false);
        
        return { success: true, playerId: newPlayerId };
      } catch (error) {
        console.error("Error joining game:", error);
        setError(`Failed to join game: ${(error as Error).message}`);
        setIsLoading(false);
        return { success: false, playerId: null };
      }
    };
    
    // Set up player and game event listeners
    const setupEventListeners = () => {
      // Set up listener for player changes
      onPlayerUpdate((players) => {
        console.log("Players updated:", players);
        setConnectedPlayers(players);
        
        // Auto-start game when enough players join
        if (players.length >= requiredPlayers && isHost) {
          console.log(`Required players reached (${players.length}/${requiredPlayers}), starting game automatically`);
          handleStartGame(players);
        }
      });
      
      // Set up listener for game start
      onGameStart((data) => {
        console.log("Game started notification received", data);
        navigateToGame();
      });
    };
    
    // Run the initialization process
    const initialize = async () => {
      setupEventListeners();
      const result = await initializePlayerAndJoinGame();
      return result;
    };
    
    // Start initialization
    initialize();
    
    // Return cleanup function
    return () => {
      // Socket disconnection is handled by the service elsewhere
    };
  }, [gameId, gameMode, isHost, isValidLink, navigate, requiredPlayers]);
  
  // Function to start the game
  const handleStartGame = async (players: any[]) => {
    if (!gameId) return;
    
    try {
      console.log(`Starting game with ${players.length} players`);
      setIsLoading(true);
      
      // Initialize the game state
      const initialGameState = initializeGameState(players, gameMode);
      initialGameState.gameId = gameId;
      initialGameState.currentPlayerId = players[0].id; // First player starts
      
      // Start the game in the backend
      const response = await startBackendGame(gameId, initialGameState);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to start game');
      }
      
      // The UI will navigate to the game when it receives the gameStart event
    } catch (error) {
      console.error("Error starting game:", error);
      setError(`Failed to start game: ${(error as Error).message}`);
      setIsLoading(false);
    }
  };
  
  // Navigate to the game
  const navigateToGame = () => {
    navigate(`/game/${gameId}`);
  };
  
  // Copy the invitation link to clipboard
  const handleCopyLink = () => {
    if (gameId) {
      // Generate link with valid=true parameter to allow joining across browsers
      const link = generateGameLink(gameId, gameMode);
      copyToClipboard(link)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        });
    }
  };
  
  return (
    <div className="lobby-container" style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Game Lobby</h1>
      
      {error ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffebee', 
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          <p style={{ color: '#c62828', margin: 0 }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Return to Home
          </button>
        </div>
      ) : isLoading ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e8f5e9', 
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #c8e6c9'
        }}>
          <p style={{ color: '#2e7d32', margin: 0 }}>Loading game lobby...</p>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: '30px', 
            padding: '20px', 
            backgroundColor: '#f9f9f9',
            borderRadius: '5px',
            border: '1px solid #eee'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Game Information</h2>
            <p><strong>Game ID:</strong> {gameId}</p>
            <p><strong>Game Mode:</strong> {gameMode === '1v1' ? '1 vs 1' : '1 vs 1 vs 1'}</p>
            
            <div style={{ marginTop: '20px' }}>
              <p style={{ marginBottom: '10px' }}>Share this link with your friends to invite them:</p>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <input
                  type="text"
                  value={gameId ? generateGameLink(gameId, gameMode) : ''}
                  readOnly
                  style={{
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    width: '100%',
                    maxWidth: '350px'
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#666', 
                marginTop: '10px',
                fontStyle: 'italic'
              }}>
                The link works across different browsers and devices
              </p>
            </div>
          </div>
          
          <div style={{ 
            marginBottom: '30px', 
            padding: '20px', 
            backgroundColor: '#f9f9f9',
            borderRadius: '5px',
            border: '1px solid #eee'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Connected Players</h2>
            <p>{connectedPlayers.length} of {requiredPlayers} players connected</p>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px',
              marginTop: '15px'
            }}>
              {connectedPlayers.map((player) => (
                <div
                  key={player.id}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: player.id === playerId ? '#e3f2fd' : '#fff',
                    borderRadius: '5px',
                    border: '1px solid #e0e0e0',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: player.id === playerId ? '#2196F3' : '#9e9e9e',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px',
                      fontWeight: 'bold'
                    }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{player.name} {player.id === playerId ? '(You)' : ''}</span>
                </div>
              ))}
              
              {/* Placeholder for waiting players */}
              {Array.from({ length: requiredPlayers - connectedPlayers.length }).map((_, i) => (
                <div
                  key={`waiting-${i}`}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#fafafa',
                    borderRadius: '5px',
                    border: '1px dashed #e0e0e0',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#9e9e9e'
                  }}
                >
                  <span
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#eeeeee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px'
                    }}
                  >
                    ?
                  </span>
                  <span>Waiting for player...</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ 
            marginBottom: '30px', 
            padding: '20px', 
            backgroundColor: isHost ? '#e8f5e9' : '#f9f9f9',
            borderRadius: '5px',
            border: isHost ? '1px solid #c8e6c9' : '1px solid #eee'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Game Status</h2>
            
            {isHost ? (
              <div>
                <p>You are the host of this game.</p>
                <p>The game will start automatically when {requiredPlayers} players have joined.</p>
                
                {connectedPlayers.length >= requiredPlayers && (
                  <button
                    onClick={() => handleStartGame(connectedPlayers)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginTop: '15px',
                      fontSize: '1rem'
                    }}
                  >
                    Start Game Now
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p>Waiting for the host to start the game...</p>
                <p>The game will begin automatically when all players have joined.</p>
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Leave Lobby
          </button>
        </>
      )}
    </div>
  );
};

export default Lobby; 