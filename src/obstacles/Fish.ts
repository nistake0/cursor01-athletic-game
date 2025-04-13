import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';
import { FISH_INITIAL_VELOCITY, FISH_GRAVITY } from '../constants';

export class Fish extends Obstacle {
    private fish: PIXI.Graphics;
    private isActive: boolean = false;
    private spawnTime: number = 0;
    private initialY: number = 0;
    private velocityY: number = FISH_INITIAL_VELOCITY;
    private gravity: number = FISH_GRAVITY;
    private hasReachedPeak: boolean = false;
    private hasCreatedSplash: boolean = false;
    private game: Game;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.fish = new PIXI.Graphics();
        this.obstacles.addChild(this.fish);
        this.game = game;
    }

    public spawn(x: number, y: number): void {
        this.isActive = true;
        this.spawnTime = Date.now();
        this.initialY = y;
        this.fish.x = x;
        this.fish.y = y;
        this.hasReachedPeak = false;
        this.hasCreatedSplash = false;
        
        // 出現時の水しぶき
        this.game.getEffectManager().createSplash(x, y, 15);
    }

    public update(currentTime: number): void {
        if (!this.isActive) return;

        const elapsed = currentTime - this.spawnTime;
        
        // 放物線運動の計算（水平方向の移動をなくす）
        const y = this.initialY + this.velocityY * (elapsed / 1000) + 0.5 * this.gravity * (elapsed / 1000) * (elapsed / 1000) * 1000;
        
        // 魚の位置を更新
        this.fish.y = y;

        // 最高点に到達したかチェック
        if (!this.hasReachedPeak && this.velocityY * (elapsed / 1000) + this.gravity * (elapsed / 1000) * (elapsed / 1000) * 1000 >= 0) {
            this.hasReachedPeak = true;
        }

        // 最初の位置に戻ってきたら消える
        if (this.hasReachedPeak && y >= this.initialY && !this.hasCreatedSplash) {
            // 消滅時の水しぶき
            this.game.getEffectManager().createSplash(this.fish.x, this.fish.y, 20);
            this.hasCreatedSplash = true;
            this.reset();
        }
    }

    public draw(): void {
        if (!this.isActive) return;
        
        this.fish.clear();
        
        // 魚の体を描画
        this.fish.beginFill(0xFF6B6B);
        this.fish.lineStyle(1, 0xE64C4C);
        
        // U字型の魚の形を描画
        this.fish.moveTo(0, 0);
        
        // 頭部分
        this.fish.lineTo(-15, -5);
        this.fish.lineTo(-20, 0);
        this.fish.lineTo(-15, 5);
        
        // 体の曲がり部分（U字型）
        this.fish.lineTo(-10, 10);
        this.fish.lineTo(0, 15);
        this.fish.lineTo(10, 10);
        
        // 尾部分
        this.fish.lineTo(15, 5);
        this.fish.lineTo(20, 0);
        this.fish.lineTo(15, -5);
        
        // 閉じる
        this.fish.lineTo(0, 0);
        
        // 尾びれを描画
        this.fish.moveTo(10, 10);
        this.fish.lineTo(20, 15);
        this.fish.lineTo(30, 10);
        this.fish.lineTo(20, 5);
        this.fish.lineTo(10, 10);
        
        // 背びれを描画
        this.fish.moveTo(-5, -5);
        this.fish.lineTo(-10, -15);
        this.fish.lineTo(-5, -10);
        this.fish.lineTo(0, -5);
        this.fish.lineTo(-5, -5);
        
        // 目を描画
        this.fish.beginFill(0xFFFFFF);
        this.fish.drawCircle(-15, -2, 3);
        this.fish.endFill();
        
        this.fish.beginFill(0x000000);
        this.fish.drawCircle(-15, -2, 1.5);
        this.fish.endFill();
        
        this.fish.endFill();
    }

    public reset(): void {
        this.isActive = false;
        this.fish.clear();
        this.fish.visible = false;
    }

    public setPosition(x: number, y: number): void {
        this.initialY = y;
        this.fish.x = x;
        this.fish.y = y;
        this.fish.visible = true;
        this.isActive = true;
        this.spawnTime = Date.now();
        this.hasReachedPeak = false;
        this.hasCreatedSplash = false;
        
        // 出現時の水しぶき
        this.game.getEffectManager().createSplash(x, y, 15);
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        if (!this.isActive) return false;
        
        const playerBounds = player.getBounds();
        const fishBounds = this.fish.getBounds();
        
        return !(playerBounds.right < fishBounds.left ||
                playerBounds.left > fishBounds.right ||
                playerBounds.bottom < fishBounds.top ||
                playerBounds.top > fishBounds.bottom);
    }
} 