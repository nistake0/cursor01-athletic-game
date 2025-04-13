import * as PIXI from 'pixi.js';
import { PlayerManager } from '../managers/PlayerManager';
import { Renderer } from './Renderer';

export class PlayerRenderer extends Renderer {
    private playerManager: PlayerManager;
    private player: PIXI.Container;
    private graphics: PIXI.Graphics;

    constructor(app: PIXI.Application, playerManager: PlayerManager) {
        super(app, playerManager.getGame());
        this.playerManager = playerManager;
        this.player = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.player.addChild(this.graphics);
        this.app.stage.addChild(this.player);
    }

    public render(): void {
        this.clear();
        this.drawStickMan();
    }

    protected clear(): void {
        this.graphics.clear();
    }

    public drawStickMan(): void {
        // PlayerManagerからプレイヤーの状態を取得
        const direction = this.playerManager.getDirection();
        const isMoving = this.playerManager.isMovingState();
        const animationTime = this.playerManager.getAnimationTime();
        const isGrounded = this.playerManager.isGroundedState();
        const isDying = this.playerManager.isDead();
        
        // より太い線と明るい色で描画
        const bodyColor = 0xFF4444; // 明るい赤色
        this.graphics.lineStyle(4, bodyColor); // 線を4ピクセルに

        if (isDying) {
            // 死亡時の姿勢（横倒れ）
            // 頭
            this.graphics.beginFill(bodyColor);
            this.graphics.drawCircle(0, -20, 12);
            this.graphics.endFill();

            // 体（横倒れ）
            this.graphics.moveTo(0, -8);
            this.graphics.lineTo(20, 12);

            // 腕（横に伸ばす）
            this.graphics.moveTo(0, 0);
            this.graphics.lineTo(-15, 0);
            this.graphics.moveTo(0, 0);
            this.graphics.lineTo(15, 0);

            // 脚（横に伸ばす）
            this.graphics.moveTo(0, 12);
            this.graphics.lineTo(-15, 12);
            this.graphics.moveTo(0, 12);
            this.graphics.lineTo(15, 12);

            // 目（バッテン目）
            // 白目は描画しない
            this.graphics.lineStyle(3, 0x000000);
            // 左目
            this.graphics.moveTo(-10, -24);
            this.graphics.lineTo(-2, -20);
            this.graphics.moveTo(-2, -24);
            this.graphics.lineTo(-10, -20);
            // 右目
            this.graphics.moveTo(2, -24);
            this.graphics.lineTo(10, -20);
            this.graphics.moveTo(10, -24);
            this.graphics.lineTo(2, -20);
        } else {
            // 通常の描画処理
            // 頭（輪郭と塗りつぶし）
            this.graphics.beginFill(bodyColor);
            this.graphics.drawCircle(0, -20, 12);
            this.graphics.endFill();

            // 体
            this.graphics.moveTo(0, -8);
            this.graphics.lineTo(0, 12);

            if (!isGrounded) {
                // ジャンプ中の姿勢
                // 腕を上げる
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(-20 * direction, -10);
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(20 * direction, -10);
                
                // 脚を曲げる
                this.graphics.moveTo(0, 12);
                this.graphics.lineTo(-15 * direction, 25);
                this.graphics.moveTo(0, 12);
                this.graphics.lineTo(15 * direction, 25);
            } else {
                // 通常の走る姿勢
                // 腕のアニメーション
                const armSwing = Math.sin(animationTime * 0.2) * (isMoving ? 0.5 : 0);
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(-15 * direction - armSwing * 10, 8);
                this.graphics.moveTo(0, 0);
                this.graphics.lineTo(15 * direction + armSwing * 10, 8);
                
                // 脚のアニメーション
                const legSwing = Math.sin(animationTime * 0.2) * (isMoving ? 0.5 : 0);
                this.graphics.moveTo(0, 12);
                this.graphics.lineTo(-10 * direction - legSwing * 15, 35);
                this.graphics.moveTo(0, 12);
                this.graphics.lineTo(10 * direction + legSwing * 15, 35);
            }

            // 目（キャラクターに表情を付ける）
            const eyeColor = 0xFFFFFF; // 白色
            this.graphics.lineStyle(0);
            this.graphics.beginFill(eyeColor);
            this.graphics.drawCircle(6 * direction, -22, 4); // 目の位置を少し調整
            this.graphics.endFill();
            
            // 瞳
            this.graphics.beginFill(0x000000);
            this.graphics.drawCircle(7 * direction, -22, 2);
            this.graphics.endFill();
        }
    }

    public getPlayer(): PIXI.Container {
        return this.player;
    }
} 