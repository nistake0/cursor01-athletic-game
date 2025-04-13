import * as PIXI from 'pixi.js';
import { Game } from './game';

export abstract class Obstacle {
    protected app: PIXI.Application;
    protected obstacles: PIXI.Graphics;
    protected game: Game;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        this.app = app;
        this.obstacles = obstacles;
        this.game = game;
    }

    /**
     * 障害物の更新処理
     * @param currentTime 現在の時間（ミリ秒）
     */
    public abstract update(currentTime: number): void;

    /**
     * 障害物の描画処理
     */
    public abstract draw(): void;

    /**
     * 障害物のリセット処理
     */
    public abstract reset(): void;

    /**
     * プレイヤーとの衝突判定
     * @param player プレイヤーオブジェクト
     * @returns 衝突した場合はtrue、そうでない場合はfalse
     */
    public abstract checkCollision(player: PIXI.Graphics): boolean;
} 