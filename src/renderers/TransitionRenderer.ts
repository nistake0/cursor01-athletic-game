import { Renderer } from './Renderer';
import { TransitionType } from '../managers/ScreenTransitionManager';

export class TransitionRenderer {
    private renderer: Renderer;
    private fadeAlpha: number = 0;
    private slideOffset: { x: number; y: number } = { x: 0, y: 0 };

    constructor(renderer: Renderer) {
        this.renderer = renderer;
    }

    public renderFade(progress: number): void {
        this.fadeAlpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
        this.renderer.drawRect(0, 0, this.renderer.getWidth(), this.renderer.getHeight(), `rgba(0, 0, 0, ${this.fadeAlpha})`);
    }

    public renderSlide(progress: number, direction: 'left' | 'right' | 'up' | 'down'): void {
        const width = this.renderer.getWidth();
        const height = this.renderer.getHeight();
        const offset = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

        switch (direction) {
            case 'left':
                this.slideOffset.x = -width * offset;
                break;
            case 'right':
                this.slideOffset.x = width * offset;
                break;
            case 'up':
                this.slideOffset.y = -height * offset;
                break;
            case 'down':
                this.slideOffset.y = height * offset;
                break;
        }

        this.renderer.drawRect(
            this.slideOffset.x,
            this.slideOffset.y,
            width,
            height,
            'rgba(0, 0, 0, 1)'
        );
    }

    public reset(): void {
        this.fadeAlpha = 0;
        this.slideOffset = { x: 0, y: 0 };
    }
} 