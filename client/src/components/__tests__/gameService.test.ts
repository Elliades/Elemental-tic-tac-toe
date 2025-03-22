import { initSocket } from '../../services/gameService';

// Mock socket.io-client
jest.mock('socket.io-client', () => {
  const mockOn = jest.fn();
  const mockEmit = jest.fn();
  const mockSocket = {
    on: mockOn,
    emit: mockEmit,
    id: 'mock-socket-id'
  };
  
  return {
    io: jest.fn().mockReturnValue(mockSocket)
  };
});

describe('Game Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  it('should initialize socket connection', () => {
    const socket = initSocket();
    
    // Basic expectation that socket is returned
    expect(socket).toBeDefined();
  });
});
