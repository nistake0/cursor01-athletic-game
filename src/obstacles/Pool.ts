import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';

export class Pool extends Obstacle {
    private player: PIXI.Graphics;
    private poolPositions: { x: number, y: number, width: number, height: number }[] = [];

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.player = game.getPlayer();
        this.initializePoolPositions();
    }

    private initializePoolPositions(): void {
        const poolWidth = 64;
        const poolSpacing = 150;
        const startX = 170;
        const poolY = this.app.screen.height - 98;

        for (let i = 0; i < 4; i++) {
            const poolX = startX + i * poolSpacing;
            this.poolPositions.push({
                x: poolX - poolWidth / 2,
                y: poolY - 10,
                width: poolWidth,
                height: 20
            });
        }
    }

    // 池の描画処理
    public draw(): void {
        this.obstacles.lineStyle(2, 0x000000);
        
        // 4つの池を配置
        const poolWidth = 64;
        const poolSpacing = 150; // 間隔を広げて4つの池をバランスよく配置
        const startX = 170; // 開始位置を調整
        const poolY = this.app.screen.height - 98;
        
        for (let i = 0; i < 4; i++) {
            const poolX = startX + i * poolSpacing;
            
            // 池の水
            this.obstacles.beginFill(0x4169E1);
            this.obstacles.drawEllipse(poolX, poolY, poolWidth / 2, 8);
            this.obstacles.endFill();
            
            // 池の縁
            this.obstacles.lineStyle(2, 0x8B4513);
            this.obstacles.beginFill(0x8B4513, 0);
            this.obstacles.drawEllipse(poolX, poolY, poolWidth / 2 + 2, 10);
            this.obstacles.endFill();

            // 水面の反射効果
            this.obstacles.lineStyle(1, 0xFFFFFF, 0.5);
            this.obstacles.moveTo(poolX - poolWidth / 3, poolY - 3);
            this.obstacles.lineTo(poolX + poolWidth / 3, poolY - 3);
        }
    }

    // 池との衝突判定
    public checkCollision(player: PIXI.Graphics): boolean {
        const playerBottom = player.y;
        const poolY = this.app.screen.height - 98;
        const poolWidth = 64;
        const poolSpacing = 150; // 間隔を広げて4つの池をバランスよく配置
        const startX = 170; // 開始位置を調整

        // プレイヤーが地面にいる場合のみ判定
        if (playerBottom >= this.app.screen.height - 121) {
            // 各池との判定
            for (let i = 0; i < 4; i++) {
                const poolX = startX + i * poolSpacing;
                const distanceFromPool = Math.abs(player.x - poolX);
                
                // プレイヤーが池の範囲内にいるか判定
                if (distanceFromPool < poolWidth / 2) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // 池の更新処理
    public update(currentTime: number): void {
        // 現在は更新処理なし
    }

    // 池のリセット処理
    public reset(): void {
        // 池を再描画
        this.draw();
    }

    public getPoolBounds(): { x: number, y: number, width: number, height: number }[] {
        return this.poolPositions;
    }
} 