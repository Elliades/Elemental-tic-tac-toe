import { io } from 'socket.io-client';
import { initSocket } from '../../services/gameService';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    id: 'mock-socket-id'
  }))
}));

describe('Game Service', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });
  
  it('should initialize socket connection', () => {
    const socket = initSocket();
    
    expect(io).toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('playerUpdate', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('gameStart', expect.any(Function));
    expect(socket.on).toHaveBeenCalledWith('gameStateUpdate', expect.any(Function));
  });
});
