import * as PIXI from 'pixi.js';
import { Renderer } from './Renderer';
import { TransitionType } from '../managers/ScreenTransitionManager';

export class TransitionRenderer {
    private renderer: Renderer;
    private fadeAlpha: number = 0;
    private slideOffset: { x: number; y: number } = { x: 0, y: 0 };
    private graphics: PIXI.Graphics;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.graphics = new PIXI.Graphics();
        this.renderer.getStage().addChild(this.graphics);
    }

    public renderFade(opacity: number): void {
        this.fadeAlpha = opacity;
        this.graphics.clear();
        this.graphics.beginFill(0x000000, this.fadeAlpha);
        this.graphics.drawRect(0, 0, this.renderer.getWidth(), this.renderer.getHeight());
        this.graphics.endFill();
    }

    public renderSlide(progress: number, direction: 'left' | 'right' | 'up' | 'down'): void {
        const width = this.renderer.getWidth();
        const height = this.renderer.getHeight();

        switch (direction) {
            case 'left':
                this.slideOffset.x = -width * progress;
                this.slideOffset.y = 0;
                break;
            case 'right':
                this.slideOffset.x = width * progress;
                this.slideOffset.y = 0;
                break;
            case 'up':
                this.slideOffset.x = 0;
                this.slideOffset.y = -height * progress;
                break;
            case 'down':
                this.slideOffset.x = 0;
                this.slideOffset.y = height * progress;
                break;
        }

        this.graphics.clear();
        this.graphics.beginFill(0x000000);
        this.graphics.drawRect(this.slideOffset.x, this.slideOffset.y, width, height);
        this.graphics.endFill();
    }

    public reset(): void {
        this.fadeAlpha = 0;
        this.slideOffset = { x: 0, y: 0 };
        this.graphics.clear();
    }

    public destroy(): void {
        this.graphics.destroy();
    }
} 