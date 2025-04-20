import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';

export class LargePool extends Obstacle {
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
        super(app, obstacles, game);
        this.initializePoolBounds();
        this.drawPriority = 10;  // 池は後ろに描画
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
        this.obstacles.clear();

        // 池を楕円形で描画
        this.obstacles.beginFill(0x4169E1);
        this.obstacles.lineStyle(2, 0x000000);
        this.obstacles.drawEllipse(
            this.poolBounds.centerX,
            this.poolBounds.centerY + 20,  // 20ピクセル下に移動
            this.poolBounds.radiusX,
            this.poolBounds.radiusY
        );

        // 池の水面の反射効果
        this.obstacles.lineStyle(1, 0xFFFFFF, 0.3);
        const reflectionCount = 10;
        for (let i = 0; i < reflectionCount; i++) {
            const angle = (i / reflectionCount) * Math.PI;
            const x = this.poolBounds.centerX + Math.cos(angle) * (this.poolBounds.radiusX - 10);
            const y = (this.poolBounds.centerY + 20) + Math.sin(angle) * (this.poolBounds.radiusY - 5);  // 20ピクセル下に移動
            this.obstacles.moveTo(x, y);
            this.obstacles.lineTo(x + 5, y);
        }
    }

    private getPlayerBoundsFromPlayer(player: PIXI.Graphics) {
        return {
            left: player.x - 15,
            right: player.x + 15,
            top: player.y - 35,
            bottom: player.y
        };
    }

    private isInWater(playerBounds: any): boolean {
        // プレーヤーが池の範囲内にいるかチェック
        return (
            playerBounds.right >= this.poolBounds.left && 
            playerBounds.left <= this.poolBounds.right && 
            playerBounds.bottom >= this.poolBounds.top - 20
        );
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        // 蓮の葉に乗っている場合、または板に乗っている場合は衝突判定をスキップ
        if (this.game.getPlayerManager().isOnLotus() || this.game.getPlayerManager().isOnPlatform()) {
            return false;
        }

        const playerBounds = this.getPlayerBoundsFromPlayer(player);
        
        // 通常の衝突判定処理
        if (this.isInWater(playerBounds)) {
            return true;
        }
        
        return false;
    }

    public update(currentTime: number): void {
        // 大きな池は動かないので、現時点では何もしない
    }

    public reset(): void {
        this.initializePoolBounds();
    }

    public getPoolBounds(): { x: number; y: number; width: number; height: number } {
        return {
            x: this.poolBounds.left,
            y: this.poolBounds.top,
            width: this.poolBounds.width,
            height: this.poolBounds.bottom - this.poolBounds.top
        };
    }
} 