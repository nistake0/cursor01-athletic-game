import { Chestnut } from './Chestnut';
import { OBSTACLES } from '../utils/constants';
import * as PIXI from 'pixi.js';
import { Game } from '../game';

export class ChestnutManager {
    private chestnuts: Chestnut[] = [];
    private readonly maxCount: number;
    private readonly spawnInterval: number;
    private lastSpawnTime: number = 0;
    private app: PIXI.Application;
    private obstacles: PIXI.Graphics;
    private game: Game;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game, maxCount: number = OBSTACLES.CHESTNUT.MAX_COUNT, spawnInterval: number = OBSTACLES.CHESTNUT.SPAWN_INTERVAL) {
        this.app = app;
        this.obstacles = obstacles;
        this.game = game;
        this.maxCount = maxCount;
        this.spawnInterval = spawnInterval;
    }

    // いがぐりの生成
    spawnChestnut(): void {
        if (this.chestnuts.length < this.maxCount) {
            const chestnut = new Chestnut(this.app, this.obstacles, this.game);
            this.chestnuts.push(chestnut);
            chestnut.spawn();
        }
    }

    // 更新処理
    update(currentTime: number): void {
        // 生成処理
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnChestnut();
            this.lastSpawnTime = currentTime;
        }

        // 更新処理
        this.chestnuts.forEach(chestnut => {
            chestnut.update(currentTime);
        });

        // 非アクティブになったいがぐりを配列から削除
        this.chestnuts = this.chestnuts.filter(chestnut => chestnut.isActiveState());
    }

    // 描画処理
    draw(): void {
        // Chestnutクラスは自身で描画を行うため、ここでは何もしない
    }

    // 衝突判定
    checkCollision(player: PIXI.Graphics): boolean {
        // 各いがぐりとの衝突判定
        return this.chestnuts.some(chestnut => chestnut.checkCollision(player));
    }

    // リセット
    reset(): void {
        this.chestnuts.forEach(chestnut => chestnut.reset());
        this.chestnuts = [];
        this.lastSpawnTime = 0;
    }

    // ゲッター
    getChestnuts(): Chestnut[] {
        return this.chestnuts;
    }
} 