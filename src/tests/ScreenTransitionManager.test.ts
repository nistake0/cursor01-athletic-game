import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScreenTransitionManager, TransitionType } from '../managers/ScreenTransitionManager';
import { GameStateManager } from '../managers/GameStateManager';
import { ScreenType, GameStatus } from '../types/GameState';
import { TransitionRenderer } from '../renderers/TransitionRenderer';
import { Renderer } from '../renderers/Renderer';
import * as PIXI from 'pixi.js';

// PIXIのモック
vi.mock('pixi.js', () => {
    return {
        Application: vi.fn().mockImplementation(() => ({
            screen: { width: 800, height: 600 },
            stage: { addChild: vi.fn() }
        })),
        Graphics: vi.fn().mockImplementation(() => ({
            clear: vi.fn(),
            beginFill: vi.fn(),
            drawRect: vi.fn(),
            endFill: vi.fn(),
            destroy: vi.fn()
        }))
    };
});

// モックRendererクラス
class MockRenderer extends Renderer {
    public render(): void {}
    protected clear(): void {}
}

describe('ScreenTransitionManager', () => {
    let screenTransitionManager: ScreenTransitionManager;
    let gameStateManager: GameStateManager;
    let transitionRenderer: TransitionRenderer;
    let mockRenderer: Renderer;
    let mockApp: PIXI.Application;
    let mockGame: any;

    beforeEach(() => {
        vi.useFakeTimers();

        // モックの作成
        mockApp = new PIXI.Application();
        mockGame = {};

        mockRenderer = new MockRenderer(mockApp, mockGame);
        gameStateManager = new GameStateManager();
        transitionRenderer = new TransitionRenderer(mockRenderer);
        screenTransitionManager = new ScreenTransitionManager(gameStateManager, transitionRenderer);
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

        it('遷移開始時にゲームの状態がTRANSITIONINGになる', () => {
            const options = {
                type: TransitionType.FADE,
                duration: 1000
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            expect(gameStateManager.getStatus()).toBe(GameStatus.TRANSITIONING);
        });
    });

    describe('遷移の更新', () => {
        it('遷移が完了すると遷移中でなくなる', () => {
            const options = {
                type: TransitionType.FADE,
                duration: 1000
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            
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
            
            vi.advanceTimersByTime(1000);
            screenTransitionManager.update();
            
            expect(gameStateManager.getScreenState().currentScreen).toBe(ScreenType.GAME);
        });

        it('遷移完了時にゲームの状態がPLAYINGに戻る', () => {
            const options = {
                type: TransitionType.FADE,
                duration: 1000
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            
            vi.advanceTimersByTime(1000);
            screenTransitionManager.update();
            
            expect(gameStateManager.getStatus()).toBe(GameStatus.PLAYING);
        });

        it('遷移完了時にコールバックが実行される', () => {
            const onComplete = vi.fn();
            const options = {
                type: TransitionType.FADE,
                duration: 1000,
                onComplete
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            
            vi.advanceTimersByTime(1000);
            screenTransitionManager.update();
            
            expect(onComplete).toHaveBeenCalled();
        });
    });

    describe('入力制御', () => {
        it('遷移中は入力がブロックされる', () => {
            const options = {
                type: TransitionType.FADE,
                duration: 1000
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            expect(screenTransitionManager.shouldBlockInput()).toBe(true);
        });

        it('遷移完了後は入力がブロックされない', () => {
            const options = {
                type: TransitionType.FADE,
                duration: 1000
            };
            screenTransitionManager.startTransition(ScreenType.GAME, options);
            
            vi.advanceTimersByTime(1000);
            screenTransitionManager.update();
            
            expect(screenTransitionManager.shouldBlockInput()).toBe(false);
        });
    });
}); 