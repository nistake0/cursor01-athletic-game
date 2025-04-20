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

    describe('画面状態の更新メソッド', () => {
        it('setTargetScreenで目標画面を設定できる', () => {
            const targetScreen = 2;
            gameStateManager.setTargetScreen(targetScreen);
            expect(gameStateManager.getScreenState().targetScreen).toBe(targetScreen);
        });

        it('setCurrentScreenで現在の画面を設定できる', () => {
            const currentScreen = 3;
            gameStateManager.setCurrentScreen(currentScreen);
            expect(gameStateManager.getScreenState().currentScreen).toBe(currentScreen);
        });

        it('setTransitioningで遷移状態を設定できる', () => {
            gameStateManager.setTransitioning(true);
            expect(gameStateManager.isScreenTransitioning()).toBe(true);
            
            gameStateManager.setTransitioning(false);
            expect(gameStateManager.isScreenTransitioning()).toBe(false);
        });
    });

    describe('リセット機能', () => {
        it('resetで初期状態に戻る', () => {
            // 状態を変更
            gameStateManager.setStatus(GameStatus.GAME_OVER);
            gameStateManager.setCurrentScreen(2);
            gameStateManager.setTransitioning(true);
            
            // リセット
            gameStateManager.reset();
            
            // 初期状態に戻っていることを確認
            expect(gameStateManager.getStatus()).toBe(GameStatus.PLAYING);
            expect(gameStateManager.getScreenState().currentScreen).toBe(1);
            expect(gameStateManager.isScreenTransitioning()).toBe(false);
        });

        it('reset時に状態変更イベントが発火する', () => {
            const callback = vi.fn();
            gameStateManager.onStateChange(callback);
            
            gameStateManager.reset();
            
            expect(callback).toHaveBeenCalled();
            expect(callback.mock.calls[0][0].type).toBe('STATUS_CHANGE');
        });
    });
}); 