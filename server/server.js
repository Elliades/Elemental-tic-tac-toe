const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from build directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// In-memory game storage
const games = new Map();
const players = new Map();

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle player joining a game
  socket.on('joinGame', (data, callback) => {
    try {
      const { gameId, playerName } = data;
      console.log(`Player ${playerName} attempting to join game ${gameId}`);

      // Create game if it doesn't exist
      if (!games.has(gameId)) {
        console.log(`Creating new game: ${gameId}`);
        games.set(gameId, {
          id: gameId,
          players: [],
          started: false,
          gameState: null,
          createdAt: Date.now()
        });
      }

      const game = games.get(gameId);

      // Check if player already exists in this game
      let playerId = null;
      for (const [id, player] of players.entries()) {
        if (player.name === playerName && player.gameId === gameId) {
          playerId = id;
          break;
        }
      }

      // Create new player if needed
      if (!playerId) {
        playerId = uuidv4();
        players.set(playerId, {
          id: playerId,
          name: playerName,
          gameId: gameId,
          socketId: socket.id,
          joinedAt: Date.now()
        });

        // Add player to game if not already in
        if (!game.players.includes(playerId)) {
          game.players.push(playerId);
        }
      } else {
        // Update socket ID for existing player
        const player = players.get(playerId);
        player.socketId = socket.id;
        players.set(playerId, player);
      }

      // Join the socket room for this game
      socket.join(gameId);

      // Add player to game if not already included
      if (!game.players.includes(playerId)) {
        game.players.push(playerId);
      }

      // Notify all clients in the room about player list changes
      const gamePlayers = game.players.map(id => players.get(id)).filter(Boolean);
      io.to(gameId).emit('playerUpdate', gamePlayers);

      // Return success with player ID
      callback({ 
        success: true, 
        playerId, 
        isHost: game.players[0] === playerId
      });
    } catch (error) {
      console.error('Error in joinGame:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Handle starting a game
  socket.on('startGame', (data, callback) => {
    try {
      const { gameId, gameState } = data;
      
      if (!games.has(gameId)) {
        return callback({ success: false, error: 'Game not found' });
      }

      const game = games.get(gameId);
      game.started = true;
      game.startedAt = Date.now();
      game.gameState = gameState;
      games.set(gameId, game);

      // Notify all clients that the game has started
      io.to(gameId).emit('gameStart', { gameId, gameState });
      
      callback({ success: true });
    } catch (error) {
      console.error('Error in startGame:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Handle game state updates
  socket.on('updateGameState', (data, callback) => {
    try {
      const { gameId, gameState } = data;
      
      if (!games.has(gameId)) {
        return callback({ success: false, error: 'Game not found' });
      }

      const game = games.get(gameId);
      game.gameState = gameState;
      game.lastUpdated = Date.now();
      games.set(gameId, game);

      // Broadcast the update to all clients except the sender
      socket.to(gameId).emit('gameStateUpdate', gameState);
      
      callback({ success: true });
    } catch (error) {
      console.error('Error in updateGameState:', error);
      callback({ success: false, error: error.message });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Find the player with this socket ID
    for (const [playerId, player] of players.entries()) {
      if (player.socketId === socket.id) {
        // Mark the player as offline but don't remove them
        player.online = false;
        player.lastSeen = Date.now();
        players.set(playerId, player);
        
        // Update the player list for the game
        if (player.gameId && games.has(player.gameId)) {
          const game = games.get(player.gameId);
          const gamePlayers = game.players.map(id => players.get(id)).filter(Boolean);
          io.to(player.gameId).emit('playerUpdate', gamePlayers);
        }
        break;
      }
    }
  });
});

// REST API endpoints

// Create a new game
app.post('/api/games', (req, res) => {
  try {
    const { creatorName } = req.body;
    const gameId = uuidv4();
    const playerId = uuidv4();
    
    // Create player
    players.set(playerId, {
      id: playerId,
      name: creatorName,
      gameId: gameId,
      online: true,
      joinedAt: Date.now()
    });
    
    // Create game
    games.set(gameId, {
      id: gameId,
      createdAt: Date.now(),
      creatorId: playerId,
      players: [playerId],
      started: false,
      gameState: null
    });
    
    res.status(201).json({ gameId, playerId });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get game information
app.get('/api/games/:gameId', (req, res) => {
  try {
    const { gameId } = req.params;
    
    if (!games.has(gameId)) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = games.get(gameId);
    const gamePlayers = game.players.map(id => {
      const player = players.get(id);
      if (!player) return null;
      
      return {
        id: player.id,
        name: player.name,
        online: player.online !== false
      };
    }).filter(Boolean);
    
    res.json({
      id: game.id,
      started: game.started,
      players: gamePlayers,
      createdAt: game.createdAt
    });
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get game state
app.get('/api/games/:gameId/state', (req, res) => {
  try {
    const { gameId } = req.params;
    
    if (!games.has(gameId)) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = games.get(gameId);
    
    if (!game.gameState) {
      return res.status(404).json({ error: 'Game not started yet' });
    }
    
    res.json(game.gameState);
  } catch (error) {
    console.error('Error getting game state:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clean up inactive games (run every hour)
setInterval(() => {
  const now = Date.now();
  const MAX_INACTIVE_TIME = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [gameId, game] of games.entries()) {
    const lastActivity = game.lastUpdated || game.startedAt || game.createdAt;
    if (now - lastActivity > MAX_INACTIVE_TIME) {
      console.log(`Removing inactive game: ${gameId}`);
      games.delete(gameId);
      
      // Remove players associated with this game
      for (const [playerId, player] of players.entries()) {
        if (player.gameId === gameId) {
          players.delete(playerId);
        }
      }
    }
  }
}, 60 * 60 * 1000); // Every hour

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server }; 