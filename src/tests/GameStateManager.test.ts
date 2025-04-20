import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameStateManager } from '../managers/GameStateManager';
import { GameStatus, ScreenType } from '../types/GameState';

describe('GameStateManager', () => {
    let gameStateManager: GameStateManager;

    beforeEach(() => {
        gameStateManager = new GameStateManager();
    });

    describe('画面遷移の状態管理', () => {
        it('初期状態では遷移中ではない', () => {
            expect(gameStateManager.isScreenTransitioning()).toBe(false);
        });

        it('画面遷移を開始すると遷移中になる', () => {
            gameStateManager.startScreenTransition(ScreenType.GAME);
            expect(gameStateManager.isScreenTransitioning()).toBe(true);
        });

        it('画面遷移を終了すると遷移中でなくなる', () => {
            gameStateManager.startScreenTransition(ScreenType.GAME);
            gameStateManager.endScreenTransition();
            expect(gameStateManager.isScreenTransitioning()).toBe(false);
        });

        it('画面遷移終了時に現在の画面が目標の画面に更新される', () => {
            const targetScreen = ScreenType.GAME;
            gameStateManager.startScreenTransition(targetScreen);
            gameStateManager.endScreenTransition();
            expect(gameStateManager.getScreenState().currentScreen).toBe(targetScreen);
        });
    });

    describe('状態変更イベント', () => {
        it('画面遷移開始時に状態変更イベントが発火する', () => {
            const callback = vi.fn();
            gameStateManager.onStateChange(callback);
            gameStateManager.startScreenTransition(ScreenType.GAME);
            expect(callback).toHaveBeenCalled();
        });

        it('画面遷移終了時に状態変更イベントが発火する', () => {
            const callback = vi.fn();
            gameStateManager.onStateChange(callback);
            gameStateManager.startScreenTransition(ScreenType.GAME);
            gameStateManager.endScreenTransition();
            expect(callback).toHaveBeenCalledTimes(2);
        });
    });
}); 