import * as PIXI from 'pixi.js';
import { SplashEffect } from './SplashEffect';

export class EffectManager {
    private splashEffects: SplashEffect[] = [];
    private app: PIXI.Application;

    constructor(app: PIXI.Application) {
        this.app = app;
    }

    public createSplash(x: number, y: number, particleCount: number): void {
        const effect = new SplashEffect(this.app);
        effect.create(x, y, particleCount);
        this.splashEffects.push(effect);
    }

    public update(): void {
        // アクティブなエフェクトを更新し、終了したエフェクトを削除
        this.splashEffects = this.splashEffects.filter(effect => {
            effect.update();
            return effect.isEffectActive();
        });
    }

    public clear(): void {
        this.splashEffects.forEach(effect => effect.clear());
        this.splashEffects = [];
    }
} 