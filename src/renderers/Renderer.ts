import * as PIXI from 'pixi.js';
import { Game } from '../game';

export abstract class Renderer {
    protected app: PIXI.Application;
    protected game: Game;

    constructor(app: PIXI.Application, game: Game) {
        this.app = app;
        this.game = game;
    }

    /**
     * レンダリングを実行する
     */
    public abstract render(): void;

    /**
     * レンダリング対象をクリアする
     */
    protected abstract clear(): void;

    /**
     * 描画を更新する
     */
    public update(): void {
        // サブクラスで実装
    }
} 