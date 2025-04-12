import * as PIXI from 'pixi.js';
import { Game } from './game';

export class LargePool {
    private app: PIXI.Application;
    private obstacles: PIXI.Graphics;
    private game: Game;
    private poolBounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
        width: number;
        centerX: number;
        centerY: number;
        radiusX: number;
        radiusY: number;
    } = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: 0,
        centerX: 0,
        centerY: 0,
        radiusX: 0,
        radiusY: 0
    };

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        this.app = app;
        this.obstacles = obstacles;
        this.game = game;
        this.initializePoolBounds();
    }

    private initializePoolBounds(): void {
        const screenWidth = this.app.screen.width;
        const poolWidth = screenWidth * 2/3;
        const poolStartX = (screenWidth - poolWidth) / 2;
        const poolEndX = poolStartX + poolWidth;
        const poolY = this.app.screen.height - 80;
        const poolDepth = 40;

        this.poolBounds = {
            left: poolStartX,
            right: poolEndX,
            top: poolY - poolDepth/2,
            bottom: poolY,
            width: poolWidth,
            centerX: poolStartX + poolWidth/2,
            centerY: poolY - poolDepth/2,
            radiusX: poolWidth/2,
            radiusY: poolDepth/2
        };
    }

    public draw(): void {
        // 池を楕円形で描画
        this.obstacles.beginFill(0x4169E1);
        this.obstacles.lineStyle(2, 0x000000);
        this.obstacles.drawEllipse(
            this.poolBounds.centerX,
            this.poolBounds.centerY,
            this.poolBounds.radiusX,
            this.poolBounds.radiusY
        );

        // 池の水面の反射効果
        this.obstacles.lineStyle(1, 0xFFFFFF, 0.3);
        const reflectionCount = 10;
        for (let i = 0; i < reflectionCount; i++) {
            const angle = (i / reflectionCount) * Math.PI;
            const x = this.poolBounds.centerX + Math.cos(angle) * (this.poolBounds.radiusX - 10);
            const y = this.poolBounds.centerY + Math.sin(angle) * (this.poolBounds.radiusY - 5);
            this.obstacles.moveTo(x, y);
            this.obstacles.lineTo(x + 5, y);
        }
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        const playerBottom = player.y;
        const playerTop = player.y - 35;
        const playerLeft = player.x - 15;
        const playerRight = player.x + 15;

        // デバッグ情報の表示
        console.log("===デバッグ情報===");
        console.log("池のbound:", {
            left: this.poolBounds.left,
            right: this.poolBounds.right,
            top: this.poolBounds.top,
            bottom: this.poolBounds.bottom
        });
        console.log("プレーヤーの位置:", {
            right: playerRight,
            left: playerLeft,
            bottom: playerBottom
        });
        console.log("================");

        // 池との衝突判定
        if (playerRight >= this.poolBounds.left && 
            playerLeft <= this.poolBounds.right && 
            playerBottom >= this.poolBounds.top - 20) {
            
            console.log("池に落ちました！");
            return true; // ゲームオーバー
        }

        return false;
    }

    public reset(): void {
        this.initializePoolBounds();
    }

    public getPoolBounds(): typeof this.poolBounds {
        return this.poolBounds;
    }
} 