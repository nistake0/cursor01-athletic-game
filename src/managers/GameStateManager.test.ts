import { describe, it, expect, vi } from 'vitest';
import { GameStateManager } from './GameStateManager';
import { GameStatus } from '../types/GameState';

describe('GameStateManager', () => {
  it('should initialize with default state', () => {
    const manager = new GameStateManager();
    const state = manager.getState();
    
    expect(state.status).toBe(GameStatus.PLAYING);
    expect(state.player.lives).toBe(3);
    expect(state.screen.currentScreen).toBe(1);
    expect(state.obstacle.obstacleList).toEqual([]);
  });

  it('should update state and emit event', () => {
    const manager = new GameStateManager();
    const callback = vi.fn();
    
    manager.onStateChange(callback);
    manager.setStatus(GameStatus.GAME_OVER);
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].type).toBe('STATUS_CHANGE');
    expect(manager.getStatus()).toBe(GameStatus.GAME_OVER);
  });

  it('should update player state', () => {
    const manager = new GameStateManager();
    const callback = vi.fn();
    
    manager.onStateChange(callback);
    manager.setPlayerState({ lives: 2 });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].type).toBe('PLAYER_CHANGE');
    expect(manager.getPlayerState().lives).toBe(2);
  });

  it('should update screen state', () => {
    const manager = new GameStateManager();
    const callback = vi.fn();
    
    manager.onStateChange(callback);
    manager.setScreenState({ currentScreen: 2 });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].type).toBe('SCREEN_CHANGE');
    expect(manager.getScreenState().currentScreen).toBe(2);
  });

  it('should update obstacle state', () => {
    const manager = new GameStateManager();
    const callback = vi.fn();
    
    manager.onStateChange(callback);
    manager.setObstacleState({ obstacleList: [{ id: 1 }] });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0].type).toBe('OBSTACLE_CHANGE');
    expect(manager.getObstacleState().obstacleList).toEqual([{ id: 1 }]);
  });

  it('should remove event listener', () => {
    const manager = new GameStateManager();
    const callback = vi.fn();
    
    manager.onStateChange(callback);
    manager.setStatus(GameStatus.GAME_OVER);
    expect(callback).toHaveBeenCalledTimes(1);
    
    manager.offStateChange(callback);
    manager.setStatus(GameStatus.PLAYING);
    expect(callback).toHaveBeenCalledTimes(1); // 回数は増えない
  });

  it('should maintain immutability of state', () => {
    const manager = new GameStateManager();
    const state = manager.getState();
    
    // 状態を直接変更しようとしても影響しない
    state.player.lives = 0;
    expect(manager.getPlayerState().lives).toBe(3);
    
    // 正しい方法で更新
    manager.setPlayerState({ lives: 0 });
    expect(manager.getPlayerState().lives).toBe(0);
  });
}); 