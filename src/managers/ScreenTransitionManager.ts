import { GameStateManager } from './GameStateManager';
import { ScreenType } from '../types/GameState';

export enum TransitionType {
    FADE = 'FADE',
    SLIDE = 'SLIDE'
}

export interface TransitionOptions {
    type: TransitionType;
    duration: number;
    direction?: 'left' | 'right' | 'up' | 'down';
}

export class ScreenTransitionManager {
    private gameStateManager: GameStateManager;
    private currentTransition: TransitionOptions | null = null;
    private startTime: number = 0;
    private isTransitioning: boolean = false;

    constructor(gameStateManager: GameStateManager) {
        this.gameStateManager = gameStateManager;
    }

    public startTransition(targetScreen: ScreenType, options: TransitionOptions): void {
        if (this.isTransitioning) {
            return;
        }

        this.currentTransition = options;
        this.startTime = Date.now();
        this.isTransitioning = true;
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
        // フェードアニメーションの実装
        const opacity = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        // TODO: フェード効果の描画処理を実装
    }

    private updateSlideTransition(progress: number): void {
        if (!this.currentTransition?.direction) return;

        const offset = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        // TODO: スライド効果の描画処理を実装
    }

    private completeTransition(): void {
        this.isTransitioning = false;
        this.currentTransition = null;
        this.gameStateManager.endScreenTransition();
    }

    public isInTransition(): boolean {
        return this.isTransitioning;
    }
} 