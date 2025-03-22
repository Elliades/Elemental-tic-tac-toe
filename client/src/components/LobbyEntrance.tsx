import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  initSocket,
  onPlayerUpdate,
  joinGame
} from '../services/gameService';

const LobbyEntrance: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const gameMode = queryParams.get('mode') || '1v1';
  
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('playerName') || '';
  });
  const [connectedPlayers, setConnectedPlayers] = useState<any[]>([]);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string>('Unknown Host');
  
  // Number of players needed based on game mode
  const requiredPlayers = gameMode === '1v1' ? 2 : 3;
  
  useEffect(() => {
    if (!gameId) {
      setError('Invalid game ID');
      return;
    }
    
    // Initialize socket
    initSocket();
    
    // Set up player update listener
    onPlayerUpdate((players) => {
      console.log('Players in lobby:', players);
      setConnectedPlayers(players);
      
      // Set host name from first player (who is the host)
      if (players.length > 0) {
        setHostName(players[0].name);
      }
    });
    
    // Request current players in lobby
    // This would need a new API endpoint on your server
    const fetchLobbyInfo = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL || 'http://localhost:3001'}/api/games/${gameId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game info');
        }
        
        const data = await response.json();
        if (data.players && Array.isArray(data.players)) {
          setConnectedPlayers(data.players);
          if (data.players.length > 0) {
            setHostName(data.players[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching lobby info:', error);
        // Don't set error state here as the player updates should still come through
      }
    };
    
    fetchLobbyInfo();
    
    return () => {
      // Socket cleanup handled elsewhere
    };
  }, [gameId, gameMode]);
  
  const handleJoinLobby = async () => {
    if (!gameId || !playerName.trim()) {
      setError('Please enter your name to join the lobby');
      return;
    }
    
    setIsJoining(true);
    setError(null);
    
    try {
      // Store name for future use
      localStorage.setItem('playerName', playerName);
      
      console.log(`Joining lobby ${gameId} as ${playerName}`);
      const result = await joinGame(gameId, playerName);
      
      if (result.success) {
        // Store player ID
        localStorage.setItem('currentPlayerId', result.playerId || '');
        console.log(`Successfully joined lobby as: ${playerName} with ID: ${result.playerId}`);
        
        // Navigate to the main lobby
        navigate(`/lobby/${gameId}?mode=${gameMode}&valid=true&host=${result.isHost || false}`);
      } else {
        setError(result.error || 'Failed to join lobby');
      }
    } catch (error) {
      console.error('Error joining lobby:', error);
      setError('Error connecting to the game server');
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px 20px',
      backgroundColor: '#f5f7fa',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginTop: '40px'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>
        Join Game Lobby
      </h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          padding: '15px', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Lobby Information */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#2c3e50' }}>Lobby Information</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Host:</strong> {hostName}</p>
            <p><strong>Game Mode:</strong> {gameMode === '1v1' ? '1 vs 1' : '1 vs 1 vs 1'}</p>
            <p><strong>Players Required:</strong> {requiredPlayers}</p>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
              Players in Lobby ({connectedPlayers.length}/{requiredPlayers})
            </h3>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px' 
            }}>
              {connectedPlayers.map((player) => (
                <div
                  key={player.id}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '5px',
                    border: '1px solid #c8e6c9',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#4caf50',
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
                  <span>{player.name}</span>
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
        </div>
        
        {/* Join Form */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#2c3e50' }}>Enter Your Name</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your Name"
              style={{
                padding: '12px 15px',
                fontSize: '16px',
                width: '100%',
                borderRadius: '5px',
                border: '1px solid #ddd',
                marginBottom: '15px'
              }}
            />
            
            <button
              onClick={handleJoinLobby}
              disabled={isJoining || !playerName.trim()}
              style={{
                width: '100%',
                padding: '12px 15px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: isJoining || !playerName.trim() ? 'not-allowed' : 'pointer',
                opacity: isJoining || !playerName.trim() ? 0.7 : 1
              }}
            >
              {isJoining ? 'Joining...' : 'Join Lobby'}
            </button>
          </div>
        </div>
        
        {/* Game Rules */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#2c3e50' }}>Game Rules</h2>
          
          <div style={{ 
            backgroundColor: '#f9f9f9',
            padding: '15px',
            borderRadius: '5px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.5' }}>
              <li>Place your elemental symbol on the board during your turn</li>
              <li>Form rows of 3, 4, or 5 symbols to score points</li>
              <li>Lineups trigger special effects like bonus spaces and definitive symbols</li>
              <li>Reach 12 points with a 5-point lead to win the game</li>
              <li>Boosted symbols can trigger chain reactions with the Spread effect</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default LobbyEntrance; 