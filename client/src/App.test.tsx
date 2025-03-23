import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock ToastProvider
jest.mock('./contexts/ToastContext', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="toast-provider">{children}</div>
}));

test('renders the game title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Primordial Elemental Tic-Tac-Toe/i);
  expect(titleElement).toBeInTheDocument();
});
