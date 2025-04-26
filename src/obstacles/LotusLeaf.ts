import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';

export class LotusLeaf extends Obstacle {
    private lotusX: number = 0;
    private lotusY: number = 0;
    private _rotation: number = 0;
    private poolBounds: any = null;
    private isInitialized: boolean = false;
    private lotusDirection: number = 1;
    private lotusSpeed: number = 1;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.drawPriority = 5;  // 蓮の葉は池より前に描画
    }

    public get rotation(): number {
        return this._rotation;
    }
    
    public set rotation(value: number) {
        this._rotation = value;
    }

    public draw(): void {
        if (!this.isInitialized) {
            return;
        }

        const lotusWidth = this.poolBounds.width / 5;
        const lotusHeight = 10;
        
        // 蓮の葉本体（濃い緑）
        this.obstacles.beginFill(0x228B22);
        this.obstacles.lineStyle(2, 0x006400);
        this.obstacles.drawEllipse(
            this.lotusX + lotusWidth/2,
            this.poolBounds.y + 20, // 水面の上に配置（15ピクセル下に移動）
            lotusWidth/2,
            lotusHeight
        );

        // 蓮の葉の模様（薄い緑の線）
        this.obstacles.lineStyle(1, 0x90EE90);
        for (let i = 0; i < 3; i++) {
            this.obstacles.drawEllipse(
                this.lotusX + lotusWidth/2,
                this.poolBounds.y + 20, // 15ピクセル下に移動
                lotusWidth/2 - 10 - i*8,
                lotusHeight - 2 - i*2
            );
        }
    }

    public update(currentTime: number): void {
        // 大きな池の境界を取得
        const largePoolBounds = this.game.getLargePoolBounds();
        
        // 大きな池の境界が取得できない場合は更新をスキップ
        if (!largePoolBounds) {
            return;
        }

        // 初回初期化
        if (!this.isInitialized) {
            console.log('LotusLeaf: updateが呼ばれました', largePoolBounds);
            this.poolBounds = largePoolBounds;
            this.lotusX = this.poolBounds.x + 50; // 左端から少し離して開始
            this.lotusY = this.poolBounds.y + this.poolBounds.height / 2;
            this.isInitialized = true;
        }

        const lotusWidth = this.poolBounds.width / 5;
        
        // 蓮の葉の移動
        this.lotusX += this.lotusSpeed * this.lotusDirection;
        
        // 池の端での反転（余裕を持たせる）
        const margin = 30; // 端での余裕
        if (this.lotusX <= this.poolBounds.x + margin) {
            this.lotusX = this.poolBounds.x + margin;
            this.lotusDirection = 1;
        } else if (this.lotusX + lotusWidth >= this.poolBounds.x + this.poolBounds.width - margin) {
            this.lotusX = this.poolBounds.x + this.poolBounds.width - margin - lotusWidth;
            this.lotusDirection = -1;
        }
        
        // 蓮の葉の回転を更新
        this.rotation = Math.sin(currentTime / 1000) * 0.1;
        
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
        
        // 蓮の葉の描画を更新
        this.draw();
    }

    private getPlayerBoundsFromPlayer(player: PIXI.Graphics) {
        return {
            left: player.x - 15,
            right: player.x + 15,
            top: player.y - 35,
            bottom: player.y
        };
    }

    public getLotusBounds(): { left: number; top: number; right: number; bottom: number; width: number } {
        const lotusWidth = this.poolBounds.width / 5;
        return {
            left: this.lotusX,
            top: this.poolBounds.y,
            right: this.lotusX + lotusWidth,
            bottom: this.poolBounds.y + 20,
            width: lotusWidth
        };
    }

    private isOnLotusLeaf(playerBounds: any, lotusBounds: any): boolean {
        if (!lotusBounds) {
            return false;
        }
        return (
            playerBounds.bottom >= lotusBounds.top - 35 &&
            playerBounds.top <= lotusBounds.bottom + 35 &&
            playerBounds.right >= lotusBounds.left - 15 &&
            playerBounds.left <= lotusBounds.right + 15 &&
            this.game.getVelocityY() >= 0
        );
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        if (!this.isInitialized) {
            return false;
        }
        const playerBounds = this.getPlayerBoundsFromPlayer(player);
        const lotusBounds = this.getLotusBounds();
        
        if (this.isOnLotusLeaf(playerBounds, lotusBounds)) {
            this.game.getPlayerManager().setOnLotus(true);
            this.addScore(10);
            return false;
        }
        
        this.game.getPlayerManager().setOnLotus(false);
        return false;
    }

    public reset(): void {
        this.lotusX = 0;
        this.lotusY = 0;
        this.rotation = 0;
        this.poolBounds = null;
        this.isInitialized = false;
        this.lotusDirection = 1;
        this.game.getPlayerManager().setOnLotus(false);
    }

    public isPlayerOnLotus(): boolean {
        return this.game.getPlayerManager().isOnLotus();
    }
} 