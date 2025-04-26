import * as PIXI from 'pixi.js';
import { SplashEffect } from './SplashEffect';
import { Game } from '../game';
import { ScorePopup } from './ScorePopup';

export class EffectManager {
    private splashEffects: SplashEffect[] = [];
    private scorePopups: ScorePopup[] = [];
    private app: PIXI.Application;
    private game: Game;

    constructor(app: PIXI.Application, game: Game) {
        this.app = app;
        this.game = game;
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

        // スコアポップアップの更新
        this.scorePopups = this.scorePopups.filter(popup => !popup.update());
    }

    public clear(): void {
        this.splashEffects.forEach(effect => effect.clear());
        this.splashEffects = [];
    }

    addScorePopup(score: number, x: number, y: number): void {
        const popup = new ScorePopup(this.game, score, x, y);
        this.scorePopups.push(popup);
    }
} 