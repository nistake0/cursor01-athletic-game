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

    /**
     * キャンバスの幅を取得する
     */
    public getWidth(): number {
        return this.app.screen.width;
    }

    /**
     * キャンバスの高さを取得する
     */
    public getHeight(): number {
        return this.app.screen.height;
    }

    /**
     * ステージを取得する
     */
    public getStage(): PIXI.Container {
        return this.app.stage;
    }

    /**
     * 矩形を描画する
     */
    public drawRect(x: number, y: number, width: number, height: number, color: string): void {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(this.parseColor(color));
        graphics.drawRect(x, y, width, height);
        graphics.endFill();
        this.app.stage.addChild(graphics);
    }

    /**
     * 色文字列をPIXIの色に変換する
     */
    private parseColor(color: string): number {
        if (color.startsWith('#')) {
            return parseInt(color.slice(1), 16);
        }
        if (color.startsWith('rgb')) {
            const matches = color.match(/\d+/g);
            if (matches && matches.length >= 3) {
                const [r, g, b] = matches.map(Number);
                return (r << 16) | (g << 8) | b;
            }
        }
        return 0x000000;
    }
} 