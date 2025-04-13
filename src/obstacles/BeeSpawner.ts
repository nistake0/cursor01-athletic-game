import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { OBSTACLES } from '../utils/constants';
import { Bee } from './Bee';
import { Obstacle } from './Obstacle';

export class BeeSpawner extends Obstacle {
    private bee: Bee;
    private lastSpawnTime: number = 0;
    private isActive: boolean = false;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.bee = new Bee(this.app, this.obstacles, this.game);
    }

    public draw(): void {
        this.bee.draw();
    }

    public update(currentTime: number): void {
        // 蜂の更新
        this.bee.update(currentTime);
        
        // 蜂が非アクティブ状態になったらフラグを更新
        if (!this.bee.isActiveState()) {
            this.isActive = false;
        }

        // 2秒ごとに新しい蜂を生成
        if (currentTime - this.lastSpawnTime >= OBSTACLES.BEE.SPAWN_INTERVAL) {
            if (!this.isActive) {
                this.spawn();
                this.lastSpawnTime = currentTime;
            }
        }
    }

    public spawn(): void {
        this.bee.spawn();
        this.isActive = true;
    }

    public reset(): void {
        this.bee.reset();
        this.isActive = false;
        this.lastSpawnTime = 0;
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        return this.bee.checkCollision(player);
    }

    public isActiveState(): boolean {
        return this.isActive;
    }
} 