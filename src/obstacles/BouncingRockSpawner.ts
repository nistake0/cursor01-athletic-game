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
        console.log('BouncingRockSpawner created');
    }

    public update(currentTime: number): void {
        if (!this.active) {
            console.log('Spawner is not active');
            return;
        }

        // 前回の更新からの経過時間を計算
        const deltaTime = this.lastUpdateTime === 0 ? 0 : currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        this.spawnTimer += deltaTime;
        console.log(`Spawn timer: ${this.spawnTimer}, Interval: ${this.spawnInterval}, Active rocks: ${this.rocks.length}`);
        
        if (this.spawnTimer >= this.spawnInterval) {
            console.log('Spawning new rock');
            this.spawnBouncingRock();
            this.spawnTimer = 0;
        }

        // 既存の岩を更新
        const beforeFilter = this.rocks.length;
        this.rocks = this.rocks.filter(rock => rock instanceof BouncingRock && rock.isActive());
        const afterFilter = this.rocks.length;
        if (beforeFilter !== afterFilter) {
            console.log(`Removed ${beforeFilter - afterFilter} inactive rocks`);
        }
        
        this.rocks.forEach(rock => rock.update(deltaTime));
    }

    private spawnBouncingRock(): void {
        const rock = new BouncingRock(this.app, this.obstacles, this.game, 800, 450);
        this.rocks.push(rock);
        this.app.stage.addChild(rock);
        console.log('New rock created at position (800, 450)');
    }

    public draw(): void {
        if (this.rocks.length > 0) {
            console.log(`Drawing ${this.rocks.length} rocks`);
        }
        this.rocks.forEach(rock => rock.draw());
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        const hasCollision = this.rocks.some(rock => rock.checkCollision(player));
        if (hasCollision) {
            console.log('Collision detected with player');
        }
        return hasCollision;
    }

    public reset(): void {
        console.log('Resetting spawner');
        this.spawnTimer = 0;
        this.lastUpdateTime = 0;
        
        // すべての岩を削除
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
        console.log('Destroying spawner');
        this.active = false;
        
        // すべての岩を削除
        this.rocks.forEach(rock => {
            if (rock instanceof BouncingRock) {
                rock.destroy();
            }
            this.app.stage.removeChild(rock);
        });
        this.rocks = [];
    }
} 