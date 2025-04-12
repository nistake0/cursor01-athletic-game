import * as PIXI from 'pixi.js';
import { PlayerManager } from '../managers/PlayerManager';
import { Renderer } from './Renderer';

export class PlayerRenderer extends Renderer {
    private playerManager: PlayerManager;
    private player: PIXI.Graphics;

    constructor(app: PIXI.Application, playerManager: PlayerManager) {
        super(app, playerManager.getGame());
        this.playerManager = playerManager;
        this.player = new PIXI.Graphics();
        this.app.stage.addChild(this.player);
    }

    public render(): void {
        this.clear();
        this.drawStickMan();
    }

    protected clear(): void {
        this.player.clear();
    }

    public drawStickMan(): void {
        // PlayerManagerからプレイヤーの状態を取得
        const direction = this.playerManager.getDirection();
        const isMoving = this.playerManager.isMovingState();
        const animationTime = this.playerManager.getAnimationTime();
        const isGrounded = this.playerManager.isGroundedState();
        
        // より太い線と明るい色で描画
        const bodyColor = 0xFF4444; // 明るい赤色
        this.player.lineStyle(4, bodyColor); // 線を4ピクセルに

        // 頭（輪郭と塗りつぶし）
        this.player.beginFill(bodyColor);
        this.player.drawCircle(0, -20, 12);
        this.player.endFill();

        // 体
        this.player.moveTo(0, -8);
        this.player.lineTo(0, 12);

        if (!isGrounded) {
            // ジャンプ中の姿勢
            // 腕を上げる
            this.player.moveTo(0, 0);
            this.player.lineTo(-20 * direction, -10);
            this.player.moveTo(0, 0);
            this.player.lineTo(20 * direction, -10);
            
            // 脚を曲げる
            this.player.moveTo(0, 12);
            this.player.lineTo(-15 * direction, 25);
            this.player.moveTo(0, 12);
            this.player.lineTo(15 * direction, 25);
        } else {
            // 通常の走る姿勢
            // 腕のアニメーション
            const armSwing = Math.sin(animationTime * 0.2) * (isMoving ? 0.5 : 0);
            this.player.moveTo(0, 0);
            this.player.lineTo(-15 * direction - armSwing * 10, 8);
            this.player.moveTo(0, 0);
            this.player.lineTo(15 * direction + armSwing * 10, 8);
            
            // 脚のアニメーション
            const legSwing = Math.sin(animationTime * 0.2) * (isMoving ? 0.5 : 0);
            this.player.moveTo(0, 12);
            this.player.lineTo(-10 * direction - legSwing * 15, 35);
            this.player.moveTo(0, 12);
            this.player.lineTo(10 * direction + legSwing * 15, 35);
        }

        // 目（キャラクターに表情を付ける）
        const eyeColor = 0xFFFFFF; // 白色
        this.player.lineStyle(0);
        this.player.beginFill(eyeColor);
        this.player.drawCircle(6 * direction, -22, 4); // 目の位置を少し調整
        this.player.endFill();
        
        // 瞳
        this.player.beginFill(0x000000);
        this.player.drawCircle(7 * direction, -22, 2);
        this.player.endFill();
    }

    public getPlayer(): PIXI.Graphics {
        return this.player;
    }
} 