import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';

export class BouncingRock extends Obstacle {
    private velocity: { x: number; y: number };
    private gravity: number = 0.8;
    private bounceFactor: number = 0.85;
    private isGrounded: boolean = false;
    private active: boolean = true;
    private graphics: PIXI.Graphics;
    private readonly GROUND_Y: number = 500; // 地面の位置を下げる（画面下端に近づける）
    private readonly ROCK_RADIUS: number = 40; // 岩の基本サイズを30から40に増加
    private readonly COLLISION_RADIUS: number = 45; // 衝突判定の半径を30から45に増加

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game, x: number, y: number) {
        super(app, obstacles, game);
        this.position.set(x, this.GROUND_Y);
        this.velocity = { x: -5, y: -20 }; // Y方向の初速を-15から-20に増加
        this.graphics = new PIXI.Graphics();
        this.graphics.visible = true;
        this.obstacles.addChild(this.graphics);
    }

    public update(currentTime: number): void {
        if (!this.active) return;

        // 重力の適用
        this.velocity.y += this.gravity;
        
        // 位置の更新
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // 地面との衝突判定
        if (this.position.y > this.GROUND_Y) {
            this.position.y = this.GROUND_Y;
            this.velocity.y = -this.velocity.y * this.bounceFactor;
            this.isGrounded = true;
        }

        // 画面外に出たら削除
        if (this.position.x < -50) {
            this.active = false;
            this.graphics.visible = false;
            this.obstacles.removeChild(this.graphics);
        }

        // グラフィックスの位置を更新
        this.graphics.position.set(this.position.x, this.position.y);
    }

    public draw(): void {
        if (!this.active) return;

        this.graphics.clear();
        this.graphics.beginFill(0x808080);
        
        // 不規則な多角形で岩を描画
        const points = 8; // 頂点の数
        const irregularity = 0.3; // 不規則さの度合い
        
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const irregularRadius = this.ROCK_RADIUS * (1 + (Math.random() - 0.5) * irregularity);
            const x = Math.cos(angle) * irregularRadius;
            const y = Math.sin(angle) * irregularRadius;
            
            if (i === 0) {
                this.graphics.moveTo(x, y);
            } else {
                this.graphics.lineTo(x, y);
            }
        }
        
        this.graphics.endFill();
        
        // 岩の表面にテクスチャを追加（小さな円を不規則に配置）
        this.graphics.beginFill(0x707070);
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.ROCK_RADIUS * 0.7;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const size = 4 + Math.random() * 5; // テクスチャのサイズも少し大きく
            this.graphics.drawCircle(x, y, size);
        }
        this.graphics.endFill();
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        if (!this.active) return false;

        const dx = this.position.x - player.x;
        const dy = this.position.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.COLLISION_RADIUS; // 衝突判定の半径を使用
    }

    public reset(): void {
        this.position.set(800, this.GROUND_Y);
        this.velocity = { x: -5, y: -20 }; // リセット時も同じ初速を設定
        this.isGrounded = false;
        this.active = true;
    }

    public isActive(): boolean {
        return this.active;
    }
    
    public destroy(): void {
        this.active = false;
        this.graphics.visible = false;
        this.obstacles.removeChild(this.graphics);
    }
} 