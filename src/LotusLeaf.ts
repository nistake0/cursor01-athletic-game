import * as PIXI from 'pixi.js';
import { Game } from './game';

export class LotusLeaf {
    private app: PIXI.Application;
    private obstacles: PIXI.Graphics;
    private game: Game;
    private lotusX: number = 0;
    private lotusDirection: number = 1;
    private lotusSpeed: number = 1;
    private isOnLotus: boolean = false;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        this.app = app;
        this.obstacles = obstacles;
        this.game = game;
    }

    public draw(poolBounds: { left: number; right: number; top: number; width: number }): void {
        const lotusWidth = poolBounds.width / 5;
        const lotusHeight = 10;
        
        // 蓮の葉の初期位置を設定（初回のみ）
        if (this.lotusX === 0) {
            this.lotusX = poolBounds.left + 50; // 左端から少し離して開始
        }

        // 蓮の葉本体（濃い緑）
        this.obstacles.beginFill(0x228B22);
        this.obstacles.lineStyle(2, 0x006400);
        this.obstacles.drawEllipse(
            this.lotusX + lotusWidth/2,
            poolBounds.top + 5, // 水面の上に配置
            lotusWidth/2,
            lotusHeight
        );

        // 蓮の葉の模様（薄い緑の線）
        this.obstacles.lineStyle(1, 0x90EE90);
        for (let i = 0; i < 3; i++) {
            this.obstacles.drawEllipse(
                this.lotusX + lotusWidth/2,
                poolBounds.top + 5,
                lotusWidth/2 - 10 - i*8,
                lotusHeight - 2 - i*2
            );
        }
    }

    public update(poolBounds: { left: number; right: number; top: number; width: number }): void {
        const lotusWidth = poolBounds.width / 5;
        
        // 蓮の葉の移動
        this.lotusX += this.lotusSpeed * this.lotusDirection;
        
        // 池の端での反転（余裕を持たせる）
        const margin = 30; // 端での余裕
        if (this.lotusX <= poolBounds.left + margin) {
            this.lotusX = poolBounds.left + margin;
            this.lotusDirection = 1;
        } else if (this.lotusX + lotusWidth >= poolBounds.right - margin) {
            this.lotusX = poolBounds.right - margin - lotusWidth;
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

    public checkCollision(poolBounds: { left: number; right: number; top: number; width: number }): boolean {
        const player = this.game.getPlayer();
        const lotusWidth = poolBounds.width / 5;
        const lotusLeft = this.lotusX;
        const lotusRight = this.lotusX + lotusWidth;
        const lotusY = poolBounds.top + 5; // 水面の位置を池の上限に合わせる

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
            this.game.getVelocityY() >= -8 && // 上昇中でもより許容
            player.x + 15 >= lotusLeft - 15 && // 判定範囲をさらに広げる
            player.x - 15 <= lotusRight + 15)) {
            
            // 蓮の葉に乗った時の処理
            player.y = lotusY;
            this.game.setVelocityY(0);
            this.game.setGrounded(true);
            this.isOnLotus = true;
            
            // デバッグ用：蓮の葉に乗ったことを表示
            console.log("gameLoop: 蓮の葉に乗りました！");
            
            return false; // 蓮の葉に乗っている場合は必ずfalseを返す
        }

        // 蓮の葉から外れた場合はフラグをリセット
        if (!(player.y === lotusY &&
            player.x + 15 >= lotusLeft &&
            player.x - 15 <= lotusRight)) {
            this.isOnLotus = false;
        }

        // 蓮の葉に乗っている場合は衝突判定をfalseにする
        return false;
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