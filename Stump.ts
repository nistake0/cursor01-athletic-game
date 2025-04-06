import * as PIXI from 'pixi.js';
import { Game } from './game';

export class Stump {
    private app: PIXI.Application;
    private obstacles: PIXI.Graphics;
    private game: Game;
    private stumps: PIXI.Graphics[] = [];
    private stumpData: { x: number; height: number }[] = [];

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        this.app = app;
        this.obstacles = obstacles;
        this.game = game;
        this.initializeStumpData();
    }

    private initializeStumpData(): void {
        const screenWidth = this.app.screen.width;
        const totalWidth = screenWidth * 2/3;
        const startX = (screenWidth - totalWidth) / 2 + 50;
        const spacing = totalWidth / 4;

        this.stumpData = [
            { x: startX + spacing * 4, height: 80 },  // 一番右の切り株
            { x: startX + spacing * 3, height: 120 }, // 2番目
            { x: startX + spacing * 2, height: 60 },  // 真ん中
            { x: startX + spacing, height: 100 },     // 4番目
            { x: startX, height: 40 }                 // 一番左の切り株
        ];
    }

    public draw(): void {
        console.log("切り株の描画を開始します");
        // 既存の切り株をクリア
        this.stumps.forEach(stump => {
            this.obstacles.removeChild(stump);
        });
        this.stumps = [];

        // 切り株を描画
        this.stumpData.forEach((data, index) => {
            console.log(`切り株${index + 1}を描画: x=${data.x}, height=${data.height}`);
            const stump = new PIXI.Graphics();
            
            // 切り株の本体（茶色）
            stump.beginFill(0x8B4513);
            stump.lineStyle(2, 0x3D1F00);
            
            const stumpWidth = 40;
            const baseY = this.app.screen.height - 80;
            
            // 切り株の本体を描画
            stump.drawRect(
                data.x - stumpWidth/2,
                baseY - data.height,
                stumpWidth,
                data.height
            );
            stump.endFill();
            
            // 年輪を描画
            stump.lineStyle(1, 0x3D1F00);
            for (let i = 1; i <= 3; i++) {
                const ringRadius = (stumpWidth/2) - (i * 5);
                stump.beginFill(0x8B4513);
                stump.drawEllipse(
                    data.x,
                    baseY - data.height,
                    ringRadius,
                    ringRadius/2
                );
                stump.endFill();
            }

            // 木の皮のテクスチャ（縦線）
            stump.lineStyle(1, 0x3D1F00);
            for (let i = 0; i < stumpWidth; i += 4) {
                stump.moveTo(data.x - stumpWidth/2 + i, baseY - data.height);
                stump.lineTo(data.x - stumpWidth/2 + i, baseY);
            }

            this.obstacles.addChild(stump);
            this.stumps.push(stump);
        });
        console.log("切り株の描画が完了しました");
    }

    public checkCollision(): boolean {
        const playerBottom = this.game.player.y;
        const playerTop = this.game.player.y - 35;
        const playerLeft = this.game.player.x - 15;
        const playerRight = this.game.player.x + 15;
        const playerVelocityY = this.game.velocityY;

        for (const stump of this.stumpData) {
            const stumpWidth = 40;
            const stumpLeft = stump.x - stumpWidth/2;
            const stumpRight = stump.x + stumpWidth/2;
            const collisionBaseY = this.app.screen.height - 100;
            const stumpTop = collisionBaseY - stump.height;
            const stumpBottom = collisionBaseY;

            // 上からの着地判定
            if (playerBottom >= stumpTop - 5 &&
                playerBottom <= stumpTop + 15 &&
                playerVelocityY >= 0 && 
                playerRight >= stumpLeft && 
                playerLeft <= stumpRight) {
                
                this.game.player.y = stumpTop;
                this.game.velocityY = 0;
                this.game.isGrounded = true;
                return false;
            }

            // 横からの衝突判定
            if (playerBottom > stumpTop &&
                playerTop < stumpBottom) {
                // 右からの衝突
                if (playerLeft <= stumpRight && 
                    playerLeft >= stumpRight - 10 &&
                    playerRight > stumpRight) {
                    this.game.player.x = stumpRight + 15;
                    return false;
                }
                // 左からの衝突
                if (playerRight >= stumpLeft && 
                    playerRight <= stumpLeft + 10 &&
                    playerLeft < stumpLeft) {
                    this.game.player.x = stumpLeft - 15;
                    return false;
                }
            }

            // 下からの衝突判定
            if (playerTop <= stumpBottom && 
                playerTop >= stumpTop - 5 &&
                playerRight >= stumpLeft && 
                playerLeft <= stumpRight) {
                this.game.velocityY = 0;
                this.game.player.y = stumpBottom + 35;
                return false;
            }

            // 高速移動時の追加衝突判定
            if (Math.abs(this.game.velocityY) > 10) {
                const nextPlayerBottom = playerBottom + this.game.velocityY;
                if (nextPlayerBottom >= stumpTop &&
                    nextPlayerBottom <= stumpBottom &&
                    playerRight >= stumpLeft &&
                    playerLeft <= stumpRight) {
                    this.game.player.y = stumpTop;
                    this.game.velocityY = 0;
                    this.game.isGrounded = true;
                    return false;
                }
            }
        }

        return false;
    }

    public update(): void {
        // 切り株は動かないので何もしない
    }

    public reset(): void {
        // 切り株をクリア
        this.stumps.forEach(stump => {
            this.obstacles.removeChild(stump);
        });
        this.stumps = [];
    }

    public getStumpData(): { x: number; height: number }[] {
        return this.stumpData;
    }
} 