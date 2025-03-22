# Primordial Elemental Tic-Tac-Toe - Testing Documentation

This document provides an overview of the testing approach for the Primordial Elemental Tic-Tac-Toe game.

## Table of Contents

1. [Running Tests](#running-tests)
2. [Testing Structure](#testing-structure)
3. [Test Categories](#test-categories)
4. [Coverage Goals](#coverage-goals)
5. [Debugging Tests](#debugging-tests)
6. [Adding New Tests](#adding-new-tests)

## Running Tests

### Prerequisites

- Node.js installed
- All dependencies installed (`npm install` in the `client` directory)

### Commands

To run all tests:
```bash
cd client
npm test -- --watchAll=false
```

To run tests in watch mode (development):
```bash
cd client
npm test
```

To run tests with coverage:
```bash
cd client
npm test -- --coverage
```

To run specific tests:
```bash
cd client
npm test -- ComponentName
```

## Testing Structure

Tests are organized in the following structure:
- Component tests are in `client/src/components/__tests__/`
- Core logic tests are in `client/src/core/__tests__/`
- Service tests are in `client/src/services/__tests__/`
- Utility tests are in `client/src/utils/__tests__/`

## Test Categories

### Component Tests

These tests verify that React components render correctly and handle user interactions as expected.

| Component | Tests | Description |
|-----------|-------|-------------|
| App | Structure | Verifies that the App component renders with correct routing structure |
| LobbyEntrance | Rendering | Verifies the lobby entrance component displays correctly |
| Lobby | Rendering, Player Management | Tests for lobby functionality (to be implemented) |
| Game | Rendering, Game State | Tests for game component (to be implemented) |
| Board | Rendering, Cell Interaction | Tests for board component (to be implemented) |
| Cell | Rendering, Click Events | Tests for cell component (to be implemented) |

### Logic Tests

These tests verify the core game mechanics.

| Function | Tests | Description |
|----------|-------|-------------|
| initializeGameState | Basic Initialization | Verifies that game state is properly initialized |
| placeSymbol | Symbol Placement | Tests for symbol placement logic (to be implemented) |
| checkGameOver | Win Conditions | Tests for game over conditions (to be implemented) |
| detectAlignments | Alignment Detection | Tests for alignment detection (to be implemented) |
| applySpreadEffect | Spread Effect | Tests for spread effect mechanics (to be implemented) |

### Service Tests

These tests verify communication with the server.

| Service | Tests | Description |
|---------|-------|-------------|
| initSocket | Socket Connection | Verifies that socket connection is established |
| joinGame | Game Joining | Tests for join game functionality (to be implemented) |
| startGame | Game Starting | Tests for start game functionality (to be implemented) |
| updateGameState | State Updates | Tests for game state updates (to be implemented) |

### Utility Tests

These tests verify helper functions.

| Function | Tests | Description |
|----------|-------|-------------|
| generateGameLink | Link Generation | Tests for game link generation (to be implemented) |
| copyToClipboard | Clipboard Interaction | Tests for clipboard functionality (to be implemented) |

## Coverage Goals

The project aims for the following test coverage:

- **Critical Paths**: 80%+ coverage
  - Game logic (alignments, scoring, win conditions)
  - Player turns and state management
  - Socket communication for real-time updates

- **Important Features**: 70%+ coverage
  - Component rendering
  - User interactions
  - Lobby functionality

- **Overall Coverage Goal**: 60%+ coverage

## Debugging Tests

If tests are failing, you can debug them by:

1. Running specific failing tests with: `npm test -- TestName`
2. Adding console.logs in tests for debugging
3. Using browser debugging by inserting `debugger;` statements
4. Checking that your mock implementations match what the code actually expects

## Adding New Tests

When adding new features, follow these guidelines for testing:

1. Create a test file in the appropriate `__tests__` directory
2. Mock external dependencies (socket.io, fetch, etc.)
3. Start with testing the simplest cases first
4. Add edge cases and error scenarios
5. Ensure tests are isolated and don't depend on other test results

Example test structure:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import YourComponent from '../YourComponent';

// Mocks
jest.mock('../../services/someService', () => ({
  someFunction: jest.fn()
}));

describe('YourComponent', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<YourComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(someService.someFunction).toHaveBeenCalled();
  });
});
```
