import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';

export class Chestnut extends Obstacle {
    private _x: number;
    private _y: number;
    private speed: number;
    private isActive: boolean;
    private graphics: PIXI.Graphics;
    private spawnTime: number;
    private readonly SPAWN_DELAY: number = 300; // 0.3秒
    private initialX: number;
    private shakeAmount: number = 20; // 揺れの大きさ

    // xのアクセサを定義
    public get x(): number {
        return this._x;
    }
    
    public set x(value: number) {
        this._x = value;
    }

    // yのアクセサを定義
    public get y(): number {
        return this._y;
    }
    
    public set y(value: number) {
        this._y = value;
    }

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this._x = 0;
        this._y = 0;
        this.speed = 5;
        this.isActive = false;
        this.graphics = new PIXI.Graphics();
        this.obstacles.addChild(this.graphics);
        this.spawnTime = 0;
        this.initialX = 0;
    }

    public spawn(): void {
        if (this.isActive) return;

        // 画面の上1/2の高さから開始（より低い位置から）
        this._y = this.app.screen.height / 2;
        
        // 画面の左右端を除いた範囲でランダムなX座標を設定
        const margin = 50; // 左右の余白
        this._x = margin + Math.random() * (this.app.screen.width - 2 * margin);
        this.initialX = this._x;
        
        this.isActive = true;
        this.spawnTime = Date.now();
        this.draw();
    }

    public draw(): void {
        if (!this.isActive) return;

        this.graphics.clear();
        
        // いがぐりの描画
        this.graphics.lineStyle(2, 0x808080); // 棘を灰色に
        this.graphics.beginFill(0xD2691E); // 明るい茶色に変更
        
        // いがぐりの本体（円形）
        this.graphics.drawCircle(this._x, this._y, 15);
        
        // いがぐりのとげ（8本）
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const startX = this._x + Math.cos(angle) * 15;
            const startY = this._y + Math.sin(angle) * 15;
            const endX = this._x + Math.cos(angle) * 25;
            const endY = this._y + Math.sin(angle) * 25;
            
            this.graphics.moveTo(startX, startY);
            this.graphics.lineTo(endX, endY);
        }
        
        this.graphics.endFill();
    }

    public update(currentTime: number): void {
        if (!this.isActive) return;

        const elapsedTime = currentTime - this.spawnTime;

        // 出現から0.3秒間は空中で揺れる
        if (elapsedTime < this.SPAWN_DELAY) {
            // サイン波で左右に揺れる
            const shake = Math.sin(elapsedTime * 0.02) * this.shakeAmount;
            this._x = this.initialX + shake;
        } else {
            // 0.3秒経過後は落下開始
            this._y += this.speed;
        }
        
        // 地面より下に落ちたら非アクティブに
        if (this._y > this.app.screen.height) {
            this.isActive = false;
            this.graphics.clear();
            return;
        }

        this.draw();
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        if (!this.isActive) return false;

        // プレイヤーといがぐりの衝突判定
        const distance = Math.sqrt(
            Math.pow(player.x - this._x, 2) + 
            Math.pow(player.y - this._y, 2)
        );

        return distance < 30; // いがぐりの半径 + プレイヤーの当たり判定
    }

    public reset(): void {
        this.isActive = false;
        this.graphics.clear();
    }

    public isActiveState(): boolean {
        return this.isActive;
    }
} 