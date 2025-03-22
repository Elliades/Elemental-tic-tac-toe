import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LobbyEntrance from '../LobbyEntrance';

// Mock the gameService to prevent actual socket connections in tests
jest.mock('../../services/gameService', () => ({
  initSocket: jest.fn(() => ({ on: jest.fn() })),
  onPlayerUpdate: jest.fn(),
  joinGame: jest.fn().mockResolvedValue({ success: true, playerId: 'test-id' })
}));

// Mock fetch for API calls
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({
    players: [{ id: 'host-id', name: 'Host Player' }]
  })
});

describe('LobbyEntrance Component', () => {
  it('renders the component correctly', () => {
    render(
      <MemoryRouter initialEntries={['/join/test-game-id?mode=1v1']}>
        <Routes>
          <Route path="/join/:gameId" element={<LobbyEntrance />} />
        </Routes>
      </MemoryRouter>
    );
    
    // Check for basic elements that should be present
    expect(screen.getByText(/Join Game Lobby/i)).toBeInTheDocument();
  });
});
