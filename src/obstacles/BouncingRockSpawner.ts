import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';
import { BouncingRock } from './BouncingRock';

export class BouncingRockSpawner extends Obstacle {
    private spawnTimer: number = 2900;  // 初期タイマーを3000に近い値に設定
    private spawnInterval: number = 3000; // 3秒ごとにスポーン
    private active: boolean = true;
    private rocks: Obstacle[] = [];
    private lastUpdateTime: number = 0;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
    }

    public update(currentTime: number): void {
        if (!this.active) return;

        const deltaTime = this.lastUpdateTime === 0 ? 0 : currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnBouncingRock();
            this.spawnTimer = 0;
        }

        const beforeFilter = this.rocks.length;
        this.rocks = this.rocks.filter(rock => rock instanceof BouncingRock && rock.isActive());
        const afterFilter = this.rocks.length;
        
        this.rocks.forEach(rock => rock.update(deltaTime));
    }

    private spawnBouncingRock(): void {
        const rock = new BouncingRock(this.app, this.obstacles, this.game, 800, 450);
        this.rocks.push(rock);
        this.app.stage.addChild(rock);
    }

    public draw(): void {
        this.rocks.forEach(rock => rock.draw());
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        return this.rocks.some(rock => rock.checkCollision(player));
    }

    public reset(): void {
        this.spawnTimer = 0;
        this.lastUpdateTime = 0;
        
        this.rocks.forEach(rock => {
            if (rock instanceof BouncingRock) {
                rock.destroy();
            }
            this.app.stage.removeChild(rock);
        });
        this.rocks = [];
        this.active = true;
    }

    public destroy(): void {
        this.active = false;
        
        this.rocks.forEach(rock => {
            if (rock instanceof BouncingRock) {
                rock.destroy();
            }
            this.app.stage.removeChild(rock);
        });
        this.rocks = [];
    }
} 