import { GameStateManager } from './GameStateManager';
import { ScreenType, GameStatus } from '../types/GameState';
import { TransitionRenderer } from '../renderers/TransitionRenderer';

export enum TransitionType {
    FADE = 'FADE',
    SLIDE = 'SLIDE'
}

export interface TransitionOptions {
    type: TransitionType;
    duration: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    onComplete?: () => void;
}

export class ScreenTransitionManager {
    private gameStateManager: GameStateManager;
    private transitionRenderer: TransitionRenderer;
    private currentTransition: TransitionOptions | null = null;
    private startTime: number = 0;
    private isTransitioning: boolean = false;

    constructor(gameStateManager: GameStateManager, transitionRenderer: TransitionRenderer) {
        this.gameStateManager = gameStateManager;
        this.transitionRenderer = transitionRenderer;
    }

    public startTransition(targetScreen: ScreenType, options: TransitionOptions): void {
        if (this.isTransitioning) {
            return;
        }

        this.currentTransition = options;
        this.startTime = Date.now();
        this.isTransitioning = true;
        
        // 遷移開始時にゲームの状態を変更
        const state = this.gameStateManager.getState();
        state.status = GameStatus.TRANSITIONING;
        this.gameStateManager.setState(state);
        
        this.gameStateManager.startScreenTransition(targetScreen);
    }

    public update(): void {
        if (!this.isTransitioning || !this.currentTransition) {
            return;
        }

        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;
        const progress = Math.min(elapsedTime / this.currentTransition.duration, 1);

        if (progress >= 1) {
            this.completeTransition();
            return;
        }

        this.updateTransition(progress);
    }

    private updateTransition(progress: number): void {
        if (!this.currentTransition) return;

        switch (this.currentTransition.type) {
            case TransitionType.FADE:
                this.updateFadeTransition(progress);
                break;
            case TransitionType.SLIDE:
                this.updateSlideTransition(progress);
                break;
        }
    }

    private updateFadeTransition(progress: number): void {
        const opacity = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        this.transitionRenderer.renderFade(opacity);
    }

    private updateSlideTransition(progress: number): void {
        if (!this.currentTransition?.direction) return;

        const offset = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        this.transitionRenderer.renderSlide(offset, this.currentTransition.direction);
    }

    private completeTransition(): void {
        // 遷移完了時にゲームの状態を元に戻す
        const state = this.gameStateManager.getState();
        state.status = GameStatus.PLAYING;
        this.gameStateManager.setState(state);

        this.gameStateManager.endScreenTransition();

        // コールバックの実行
        if (this.currentTransition?.onComplete) {
            this.currentTransition.onComplete();
        }

        this.isTransitioning = false;
        this.currentTransition = null;
        this.transitionRenderer.reset();
    }

    public isInTransition(): boolean {
        return this.isTransitioning;
    }

    public shouldBlockInput(): boolean {
        return this.isTransitioning;
    }
} 