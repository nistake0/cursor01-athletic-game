import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';

export class Bee extends Obstacle {
    private graphics: PIXI.Graphics;
    private isActive: boolean = false;
    private _x: number = 0;
    private _y: number = 0;
    private velocityX: number = 0;
    private velocityY: number = 0;
    private speed: number;
    private readonly BEE_WIDTH: number = 15;
    private readonly BEE_HEIGHT: number = 10;
    private readonly MIN_Y: number = 100; // 最小の高さ
    private readonly MAX_Y: number = 400; // 最大の高さ
    private readonly GROUND_Y: number = 480; // 地面のY座標（600 - 120）

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.speed = 5;
        this.graphics = new PIXI.Graphics();
        this.obstacles.addChild(this.graphics);
    }

    public get x(): number {
        return this._x;
    }

    public set x(value: number) {
        this._x = value;
    }

    public get y(): number {
        return this._y;
    }

    public set y(value: number) {
        this._y = value;
    }

    public spawn(): void {
        if (this.isActive) return;

        // 画面右端から開始
        this.x = this.app.screen.width + this.BEE_WIDTH;
        
        // プレイヤーのジャンプの最大高さを計算
        // ジャンプ力: -12, 重力: 0.5
        // 最大高さ = 初期位置 - (ジャンプ力^2 / (2 * 重力))
        const jumpForce = 12;
        const gravity = 0.5;
        const maxJumpHeight = (jumpForce * jumpForce) / (2 * gravity);
        const maxY = this.GROUND_Y - maxJumpHeight;
        
        // ランダムな高さを設定（地面から最大ジャンプ高さの範囲内）
        this.y = this.GROUND_Y - (Math.random() * maxJumpHeight);
        
        this.isActive = true;
        this.draw();
    }

    public draw(): void {
        if (!this.isActive) return;

        this.graphics.clear();
        
        // 蜂の描画
        this.graphics.lineStyle(2, 0x000000);
        this.graphics.beginFill(0xFFFF00);
        
        // 蜂の体（楕円形）
        this.graphics.drawEllipse(this.x, this.y, this.BEE_WIDTH / 2, this.BEE_HEIGHT / 2);
        
        // 蜂の羽（2枚）
        this.graphics.beginFill(0xFFFFFF, 0.7);
        // 左の羽
        this.graphics.drawEllipse(this.x - 10, this.y - 5, 8, 12);
        // 右の羽
        this.graphics.drawEllipse(this.x - 10, this.y + 5, 8, 12);
        
        // 蜂の目
        this.graphics.beginFill(0x000000);
        this.graphics.drawCircle(this.x + 8, this.y - 3, 3);
        
        // 蜂の針
        this.graphics.lineStyle(2, 0x000000);
        this.graphics.moveTo(this.x - this.BEE_WIDTH / 2, this.y);
        this.graphics.lineTo(this.x - this.BEE_WIDTH / 2 - 10, this.y);
        
        this.graphics.endFill();
    }

    public update(currentTime: number): void {
        if (!this.isActive) return;

        // 左に移動
        this.x -= this.speed;
        
        // 画面左端より左に行ったら非アクティブに
        if (this.x < -this.BEE_WIDTH) {
            this.isActive = false;
            this.graphics.clear();
            return;
        }

        this.draw();
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        if (!this.isActive) return false;
        
        const playerBounds = player.getBounds();
        const beeBounds = this.graphics.getBounds();
        
        // プレイヤーが蜂を飛び越えたかチェック
        if (player.x > beeBounds.right && player.y < beeBounds.top) {
            this.addScore(20);
        }
        
        // 衝突判定の範囲をさらに小さくする
        const collisionMargin = 8;  // 5から8に変更（より内側で判定）
        return !(playerBounds.right < beeBounds.left + collisionMargin ||
                playerBounds.left > beeBounds.right - collisionMargin ||
                playerBounds.bottom < beeBounds.top + collisionMargin ||
                playerBounds.top > beeBounds.bottom - collisionMargin);
    }

    public reset(): void {
        this.isActive = false;
        this.graphics.clear();
    }

    public isActiveState(): boolean {
        return this.isActive;
    }
} 