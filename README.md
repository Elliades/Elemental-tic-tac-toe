# Primordial Elemental Tic-Tac-Toe

An enhanced version of Tic-Tac-Toe where players compete using elemental symbols on a 9×9 grid. Form alignments, trigger special effects, and outmaneuver your opponents in this strategic multiplayer game!

## Features

- 🎮 Real-time multiplayer gameplay
- 🌟 Special effects and bonuses
- 🔄 Dynamic board interactions
- 🎯 Multiple game modes (1v1, 1v1v1)
- 💫 Unique elemental symbols

## Game Rules

### Basic Gameplay
- Players take turns placing their elemental symbols on the board
- Form rows of 3, 4, or 5 symbols to score points
- First player to reach 12 points with a 5-point lead wins

### Special Effects
- **3-in-a-row**: 1 point, 2 bonuses, 1 definitive symbol
- **4-in-a-row**: 2 points, 3 bonuses, 1 boosted definitive symbol
- **5-in-a-row**: 3 points, 2 boosted definitive symbols, 2 spread effects, exclusion zone

### Symbol Types
- **Regular Symbol**: Removed when part of an alignment
- **Definitive Symbol**: Stays on the board after alignment
- **Boosted Symbol**: Triggers additional spread when adjacent

## Technology Stack

- React (TypeScript)
- Socket.io for real-time communication
- Express.js backend
- Modern CSS styling

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/Elliades/Elemental-tic-tac-toe.git
cd Elemental-tic-tac-toe
\`\`\`

2. Install dependencies for both client and server:
\`\`\`bash
# Install client dependencies
cd elemental-morpion
npm install

# Install server dependencies
cd server
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
# From the root directory
npm run dev
\`\`\`

The game will be available at `http://localhost:3000`, and the server will run on `http://localhost:3001`.

## Development

### Project Structure

```plaintext
├── client                    # Frontend React application
│   ├── public               # Static files
│   │   ├── index.html      # HTML entry point
│   │   └── ...             # Other public assets
│   ├── src
│   │   ├── components      # React components
│   │   │   ├── Board.tsx   # Main board component
│   │   │   ├── Cell.tsx    # Cell component
│   │   │   ├── Game.tsx    # Game component
│   │   │   ├── Lobby.tsx   # Waiting/invitation page
│   │   │   └── HomePage.tsx # Thematic home page
│   │   ├── core            # Game core logic
│   │   │   ├── gameLogic.ts      # Main game rules
│   │   │   ├── spreadEffect.ts   # Spread effect logic
│   │   │   └── scoring.ts        # Scoring management
│   │   ├── config          # Configuration files
│   │   │   └── gameConfig.ts     # Game settings
│   │   ├── services        # API/Socket services
│   │   ├── types          # TypeScript type definitions
│   │   └── utils          # Utility functions
│   ├── package.json       # Client dependencies
│   └── tsconfig.json      # TypeScript configuration
├── server                  # Backend Node.js server
│   ├── server.js          # Express server setup
│   └── package.json       # Server dependencies
├── docs                   # Documentation
│   ├── gameLogic.md      # Game logic documentation
│   └── spreadEffect.md   # Spread effect documentation
└── package.json          # Root workspace configuration
```

### Available Scripts

- `npm start`: Start the client development server
- `npm run server`: Start the backend server
- `npm run dev`: Start both client and server concurrently
- `npm run build`: Build the production version
- `npm test`: Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by classic Tic-Tac-Toe
- Enhanced with elemental themes and special effects
- Built with modern web technologies
