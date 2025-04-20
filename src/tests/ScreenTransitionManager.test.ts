import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenTransitionManager, TransitionType } from '../managers/ScreenTransitionManager';
import { GameStateManager } from '../managers/GameStateManager';
import { ScreenType } from '../types/GameState';

describe('ScreenTransitionManager', () => {
    let screenTransitionManager: ScreenTransitionManager;
    let gameStateManager: GameStateManager;

    beforeEach(() => {
        vi.useFakeTimers();
        gameStateManager = new GameStateManager();
        screenTransitionManager = new ScreenTransitionManager(gameStateManager);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('遷移の開始', () => {
        it('遷移を開始すると遷移中になる', () => {
            const options = {
                type: TransitionType.FADE,
                duration: 1000
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            expect(screenTransitionManager.isInTransition()).toBe(true);
        });

        it('遷移中に新しい遷移を開始しようとすると何も起こらない', () => {
            const options = {
                type: TransitionType.FADE,
                duration: 1000
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            screenTransitionManager.startTransition(ScreenType.TITLE, options);
            expect(gameStateManager.getScreenState().targetScreen).toBe(ScreenType.GAME);
        });
    });

    describe('遷移の更新', () => {
        it('遷移が完了すると遷移中でなくなる', () => {
            const options = {
                type: TransitionType.FADE,
                duration: 1000
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            
            // 遷移時間を進める
            vi.advanceTimersByTime(1000);
            screenTransitionManager.update();
            
            expect(screenTransitionManager.isInTransition()).toBe(false);
        });

        it('遷移完了時に画面が更新される', () => {
            const options = {
                type: TransitionType.FADE,
                duration: 1000
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            
            // 遷移時間を進める
            vi.advanceTimersByTime(1000);
            screenTransitionManager.update();
            
            expect(gameStateManager.getScreenState().currentScreen).toBe(ScreenType.GAME);
        });
    });
}); 