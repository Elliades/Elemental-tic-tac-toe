import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateId } from '../utils/helpers';
import { GAME_MODES } from '../config/gameConfig';
import { createGame } from '../services/gameService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState<string>(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('playerName') || '';
  });
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateGame = async (gameMode: '1v1' | '1v1v1') => {
    if (isCreating) return; // Prevent double-clicks
    setIsCreating(true);
    
    try {
      // Validate player name
      let playerNameToUse = playerName.trim();
      if (!playerNameToUse) {
        playerNameToUse = `Player ${Math.floor(Math.random() * 1000)}`;
        setPlayerName(playerNameToUse);
      }
      
      // Store player name in localStorage for persistence
      localStorage.setItem('playerName', playerNameToUse);
      
      console.log(`Creating new game with player: ${playerNameToUse}`);
      
      // Create game using the backend service
      const { gameId, playerId } = await createGame(playerNameToUse);
      console.log(`Game created with ID: ${gameId}, player ID: ${playerId}`);
      
      // Store player ID in localStorage
      localStorage.setItem('currentPlayerId', playerId);
      
      // Navigate to the lobby
      navigate(`/lobby/${gameId}?mode=${gameMode}&host=true&valid=true`);
    } catch (error) {
      console.error("Error creating game:", error);
      alert("Failed to create game. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="home-container" style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: '20px',
        background: 'linear-gradient(45deg, #ff9966, #ff5e62)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Primordial Elemental Tic-Tac-Toe
      </h1>
      
      <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#555' }}>
        Align your elemental symbols, trigger effects, and outmaneuver your opponents in this enhanced version of Tic-Tac-Toe!
      </p>
      
      <div style={{ marginBottom: '30px' }}>
        <label htmlFor="playerName" style={{ display: 'block', marginBottom: '10px', fontSize: '1.1rem' }}>
          Enter Your Name:
        </label>
        <input
          type="text"
          id="playerName"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Your Name"
          style={{
            padding: '10px 15px',
            fontSize: '1rem',
            width: '100%',
            maxWidth: '300px',
            borderRadius: '5px',
            border: '1px solid #ccc'
          }}
        />
      </div>
      
      <div className="game-modes" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button
          onClick={() => handleCreateGame(GAME_MODES.ONE_VS_ONE as '1v1')}
          disabled={isCreating}
          style={{
            padding: '15px 30px',
            fontSize: '1.2rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: isCreating ? 0.7 : 1
          }}
        >
          <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🔥 vs 💧</span>
          <span>{isCreating ? 'Creating...' : '1 vs 1'}</span>
        </button>
        
        <button
          onClick={() => handleCreateGame(GAME_MODES.ONE_VS_ONE_VS_ONE as '1v1v1')}
          disabled={isCreating}
          style={{
            padding: '15px 30px',
            fontSize: '1.2rem',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isCreating ? 'not-allowed' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: isCreating ? 0.7 : 1
          }}
        >
          <span style={{ fontSize: '2rem', marginBottom: '10px' }}>🔥 vs 💧 vs 💨</span>
          <span>{isCreating ? 'Creating...' : '1 vs 1 vs 1'}</span>
        </button>
      </div>
      
      <div className="game-rules" style={{ 
        marginTop: '40px', 
        textAlign: 'left',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '5px',
        border: '1px solid #eee'
      }}>
        <h2 style={{ marginBottom: '15px', color: '#333' }}>How to Play</h2>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.5' }}>
          <li>Place your elemental symbol on the board during your turn</li>
          <li>Form rows of 3, 4, or 5 symbols to score points</li>
          <li>Lineups trigger special effects like bonus spaces and definitive symbols</li>
          <li>Reach 12 points with a 5-point lead to win the game</li>
          <li>Boosted symbols can trigger chain reactions with the Spread effect</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage; 