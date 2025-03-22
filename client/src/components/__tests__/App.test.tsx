import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock the router and child components
jest.mock('react-router-dom', () => ({
  HashRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ path }: { path: string }) => <div data-testid={`route-${path.replace(/\//g, '-')}`}>{path}</div>
}));

// Mock the components we're not testing
jest.mock('../../components/HomePage', () => () => <div>HomePage Mock</div>);
jest.mock('../../components/LobbyEntrance', () => () => <div>LobbyEntrance Mock</div>);
jest.mock('../../components/Lobby', () => () => <div>Lobby Mock</div>);
jest.mock('../../components/Game', () => () => <div>Game Mock</div>);

describe('App Component', () => {
  it('renders main app structure correctly', () => {
    render(<App />);
    
    // Test that routes are rendered
    expect(screen.getByTestId('router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
    expect(screen.getByTestId('route--')).toBeInTheDocument(); // Root route
    expect(screen.getByTestId('route--join-:gameId')).toBeInTheDocument();
    expect(screen.getByTestId('route--lobby-:gameId')).toBeInTheDocument();
    expect(screen.getByTestId('route--game-:gameId')).toBeInTheDocument();
  });
}); 