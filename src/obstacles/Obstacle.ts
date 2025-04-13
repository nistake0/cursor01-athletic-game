import * as PIXI from 'pixi.js';
import { Game } from '../game';

export abstract class Obstacle {
    protected app: PIXI.Application;
    protected obstacles: PIXI.Graphics;
    protected game: Game;
    protected drawPriority: number = 0;  // 描画優先度（低い数値ほど上に描画される）

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        this.app = app;
        this.obstacles = obstacles;
        this.game = game;
    }

    public getDrawPriority(): number {
        return this.drawPriority;
    }

    public abstract draw(): void;
    public abstract checkCollision(player: PIXI.Graphics): boolean;
    public abstract update(currentTime: number): void;
    public abstract reset(): void;
} 