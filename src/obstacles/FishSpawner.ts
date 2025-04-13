import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';
import { Fish } from './Fish';
import { Pool } from './Pool';

export class FishSpawner extends Obstacle {
    private fish: Fish;
    private lastSpawnTime: number = 0;
    private spawnInterval: number = 2000; // 2秒ごとに出現
    private pool: Pool | null = null;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.fish = new Fish(this.app, this.obstacles, this.game);
        this.findPool();
    }

    private findPool(): void {
        // 画面内のPoolを探す
        const pool = this.game.obstacleList.find(obstacle => obstacle instanceof Pool) as Pool;
        if (pool) {
            this.pool = pool;
            console.log('Pool found:', pool);
        } else {
            console.warn('Pool not found in the current screen');
        }
    }

    public draw(): void {
        this.fish.draw();
    }

    public update(currentTime: number): void {
        this.fish.update(currentTime);

        // 一定時間ごとに魚を生成
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnFish();
            this.lastSpawnTime = currentTime;
        }
    }

    private spawnFish(): void {
        if (!this.pool) {
            console.warn('Cannot spawn fish: Pool not found');
            return;
        }

        const poolBoundsList = this.pool.getPoolBounds();
        console.log('Pool bounds list:', poolBoundsList);

        if (poolBoundsList.length === 0) {
            console.warn('No pool bounds available');
            return;
        }

        // ランダムに池を選択
        const randomIndex = Math.floor(Math.random() * poolBoundsList.length);
        const selectedPool = poolBoundsList[randomIndex];
        console.log('Selected pool:', selectedPool);

        // 選択した池の底に魚を出現させる
        const spawnPoint = {
            x: selectedPool.x + selectedPool.width / 2,
            y: selectedPool.y + selectedPool.height
        };

        console.log('Spawning fish at:', spawnPoint);
        this.fish.reset();
        this.fish.setPosition(spawnPoint.x, spawnPoint.y);
    }

    public reset(): void {
        this.fish.reset();
        this.lastSpawnTime = 0;
        this.findPool(); // 画面遷移後にPoolを再検索
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        return this.fish.checkCollision(player);
    }

    public getDrawPriority(): number {
        return 2; // 池の上に描画
    }
} 