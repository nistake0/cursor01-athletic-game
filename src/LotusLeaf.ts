import * as PIXI from 'pixi.js';
import { Game } from './game';

export class LotusLeaf {
    private obstacles: PIXI.Graphics;
    private game: Game;
    private lotusX: number = 0;
    private lotusDirection: number = 1;
    private lotusSpeed: number = 1;
    private isOnLotus: boolean = false;
    private poolBounds: { left: number; right: number; top: number; width: number };

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game, poolBounds: { left: number; right: number; top: number; width: number }) {
        this.obstacles = obstacles;
        this.game = game;
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

    public update(): void {
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
        if (this.isOnLotus) {
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

    public checkCollision(): boolean {
        const player = this.game.getPlayer();
        const lotusWidth = this.poolBounds.width / 5;
        const lotusLeft = this.lotusX;
        const lotusRight = this.lotusX + lotusWidth;
        const lotusY = this.poolBounds.top + 5; // 水面の位置を池の上限に合わせる

        // デバッグ情報の表示
        console.log("蓮の葉のbound:", {
            left: lotusLeft,
            right: lotusRight,
            y: lotusY
        });
        console.log("isOnLotus:", this.isOnLotus);

        // 蓮の葉に乗っているかどうかを判定
        if ((player.y >= lotusY - 35 && // 判定範囲をさらに広げる
            player.y <= lotusY + 35 && // 判定範囲をさらに広げる
            player.x >= lotusLeft - 15 && // 判定範囲をさらに広げる
            player.x <= lotusRight + 15) && // 判定範囲をさらに広げる
            this.game.getVelocityY() >= 0) { // 落下中のみ判定
            this.isOnLotus = true;
            return false; // 蓮の葉に乗っている場合は衝突しない
        } else {
            this.isOnLotus = false;
            return false; // 蓮の葉との衝突は常にfalse
        }
    }

    public reset(): void {
        this.lotusX = 0;
        this.lotusDirection = 1;
        this.isOnLotus = false;
    }

    public isPlayerOnLotus(): boolean {
        return this.isOnLotus;
    }
} 