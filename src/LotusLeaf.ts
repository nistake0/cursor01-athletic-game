import * as PIXI from 'pixi.js';
import { Game } from './game';
import { Obstacle } from './Obstacle';

export class LotusLeaf extends Obstacle {
    private lotusX: number = 0;
    private lotusDirection: number = 1;
    private lotusSpeed: number = 1;
    private poolBounds: { left: number; right: number; top: number; width: number };

    constructor(obstacles: PIXI.Graphics, game: Game, poolBounds: { left: number; right: number; top: number; width: number }) {
        super(game.getApp(), obstacles, game);
        this.poolBounds = poolBounds;
    }

    public draw(): void {
        const lotusWidth = this.poolBounds.width / 5;
        const lotusHeight = 10;
        
        // 蓮の葉の初期位置を設定（初回のみ）
        if (this.lotusX === 0) {
            this.lotusX = this.poolBounds.left + 50; // 左端から少し離して開始
        }

        // 蓮の葉本体（濃い緑）
        this.obstacles.beginFill(0x228B22);
        this.obstacles.lineStyle(2, 0x006400);
        this.obstacles.drawEllipse(
            this.lotusX + lotusWidth/2,
            this.poolBounds.top + 5, // 水面の上に配置
            lotusWidth/2,
            lotusHeight
        );

        // 蓮の葉の模様（薄い緑の線）
        this.obstacles.lineStyle(1, 0x90EE90);
        for (let i = 0; i < 3; i++) {
            this.obstacles.drawEllipse(
                this.lotusX + lotusWidth/2,
                this.poolBounds.top + 5,
                lotusWidth/2 - 10 - i*8,
                lotusHeight - 2 - i*2
            );
        }
    }

    public update(currentTime: number): void {
        const lotusWidth = this.poolBounds.width / 5;
        
        // 蓮の葉の移動
        this.lotusX += this.lotusSpeed * this.lotusDirection;
        
        // 池の端での反転（余裕を持たせる）
        const margin = 30; // 端での余裕
        if (this.lotusX <= this.poolBounds.left + margin) {
            this.lotusX = this.poolBounds.left + margin;
            this.lotusDirection = 1;
        } else if (this.lotusX + lotusWidth >= this.poolBounds.right - margin) {
            this.lotusX = this.poolBounds.right - margin - lotusWidth;
            this.lotusDirection = -1;
        }

        // プレイヤーが蓮の葉に乗っている場合の処理
        if (this.game.getPlayerManager().isOnLotus()) {
            const player = this.game.getPlayer();
            // 蓮の葉と一緒に移動
            player.x += this.lotusSpeed * this.lotusDirection;
            
            // 蓮の葉の範囲内に留める
            const lotusLeft = this.lotusX;
            const lotusRight = this.lotusX + lotusWidth;
            if (player.x - 15 < lotusLeft) {
                player.x = lotusLeft + 15;
            } else if (player.x + 15 > lotusRight) {
                player.x = lotusRight - 15;
            }
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

    private getLotusBounds() {
        const lotusWidth = this.poolBounds.width / 5;
        return {
            left: this.lotusX,
            right: this.lotusX + lotusWidth,
            top: this.poolBounds.top + 5,
            bottom: this.poolBounds.top + 15
        };
    }

    private isOnLotusLeaf(playerBounds: any, lotusBounds: any): boolean {
        return (
            playerBounds.bottom >= lotusBounds.top - 35 &&
            playerBounds.top <= lotusBounds.bottom + 35 &&
            playerBounds.right >= lotusBounds.left - 15 &&
            playerBounds.left <= lotusBounds.right + 15 &&
            this.game.getVelocityY() >= 0
        );
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        const playerBounds = this.getPlayerBoundsFromPlayer(player);
        const lotusBounds = this.getLotusBounds();
        
        if (this.isOnLotusLeaf(playerBounds, lotusBounds)) {
            this.game.getPlayerManager().setOnLotus(true);
            return false;
        }
        
        this.game.getPlayerManager().setOnLotus(false);
        return false;
    }

    public reset(): void {
        this.lotusX = 0;
        this.lotusDirection = 1;
        this.game.getPlayerManager().setOnLotus(false);
    }

    public isPlayerOnLotus(): boolean {
        return this.game.getPlayerManager().isOnLotus();
    }
} 