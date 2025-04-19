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
        const isOnRope = this.playerManager.isOnRope();
        
        // より太い線と明るい色で描画
        const bodyColor = 0xFF4444; // 明るい赤色
        this.graphics.lineStyle(4, bodyColor); // 線を4ピクセルに

        if (isDying) {
            this.drawDyingStickMan(animationTime, bodyColor);
        } else if (isOnRope) {
            this.drawRopeStickMan(animationTime, bodyColor, direction);
        } else {
            this.drawAliveStickMan(animationTime, bodyColor, direction, isMoving, isGrounded);
        }
    }

    private drawRopeStickMan(animationTime: number, bodyColor: number, direction: number): void {
        // 頭（輪郭と塗りつぶし）
        this.graphics.beginFill(bodyColor);
        this.graphics.drawCircle(0, -20, 12);
        this.graphics.endFill();

        // 体（ロープにつかまっている姿勢）
        this.graphics.moveTo(0, -8);
        this.graphics.lineTo(0, 12);

        // 腕（ロープにつかまっている姿勢）
        this.drawRopeArms(animationTime, direction);

        // 脚（ロープにつかまっている姿勢）
        this.drawRopeLegs(animationTime, direction);

        // 目（キャラクターに表情を付ける）
        const eyeColor = 0xFFFFFF; // 白色
        this.graphics.lineStyle(0);
        this.graphics.beginFill(eyeColor);
        this.graphics.drawCircle(6 * direction, -22, 4);
        this.graphics.endFill();
        
        // 瞳
        this.graphics.beginFill(0x000000);
        this.graphics.drawCircle(7 * direction, -22, 2);
        this.graphics.endFill();
    }

    private drawRopeArms(animationTime: number, direction: number): void {
        // 腕のアニメーション（ロープにつかまっている姿勢）
        const armSwing = Math.sin(animationTime * 0.2) * 0.3; // ロープの揺れに合わせて腕を動かす
        
        // 左腕（肘を曲げてロープにつかまっている）
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(-8 * direction - armSwing * 5, -5); // 上腕
        this.graphics.lineTo(-12 * direction - armSwing * 8, 0); // 前腕
        
        // 右腕（肘を曲げてロープにつかまっている）
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(8 * direction + armSwing * 5, -5); // 上腕
        this.graphics.lineTo(12 * direction + armSwing * 8, 0); // 前腕
    }

    private drawRopeLegs(animationTime: number, direction: number): void {
        // 脚のアニメーション（ロープにつかまっている姿勢）
        const legSwing = Math.sin(animationTime * 0.2) * 0.3; // ロープの揺れに合わせて脚を動かす
        
        // 左脚（ブランと下に垂らす）
        this.graphics.moveTo(0, 12);
        this.graphics.lineTo(-3 * direction - legSwing * 5, 35); // まっすぐ下に垂らす
        
        // 右脚（ブランと下に垂らす）
        this.graphics.moveTo(0, 12);
        this.graphics.lineTo(3 * direction + legSwing * 5, 35); // まっすぐ下に垂らす
    }

    private drawAliveStickMan(
        animationTime: number,
        bodyColor: number,
        direction: number,
        isMoving: boolean,
        isGrounded: boolean
    ): void {
        // 頭（輪郭と塗りつぶし）
        this.graphics.beginFill(bodyColor);
        this.graphics.drawCircle(0, -20, 12);
        this.graphics.endFill();

        // 体
        this.graphics.moveTo(0, -8);
        this.graphics.lineTo(0, 12);

        if (!isGrounded) {
            // ジャンプ中の姿勢
            this.drawJumpingArms(direction);
            this.drawJumpingLegs(direction);
        } else {
            // 通常の走る姿勢
            this.drawRunningArms(animationTime, direction, isMoving);
            this.drawRunningLegs(animationTime, direction, isMoving);
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

    private drawJumpingArms(direction: number): void {
        // 腕を上げる
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(-20 * direction, -10);
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(20 * direction, -10);
    }

    private drawJumpingLegs(direction: number): void {
        // 脚を曲げる
        this.graphics.moveTo(0, 12);
        this.graphics.lineTo(-15 * direction, 25);
        this.graphics.moveTo(0, 12);
        this.graphics.lineTo(15 * direction, 25);
    }

    private drawRunningArms(animationTime: number, direction: number, isMoving: boolean): void {
        // 腕のアニメーション
        const armSwing = Math.sin(animationTime * 0.2) * (isMoving ? 0.5 : 0);
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(-15 * direction - armSwing * 10, 8);
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(15 * direction + armSwing * 10, 8);
    }

    private drawRunningLegs(animationTime: number, direction: number, isMoving: boolean): void {
        // 脚のアニメーション
        const legSwing = Math.sin(animationTime * 0.2) * (isMoving ? 0.5 : 0);
        this.graphics.moveTo(0, 12);
        this.graphics.lineTo(-10 * direction - legSwing * 15, 35);
        this.graphics.moveTo(0, 12);
        this.graphics.lineTo(10 * direction + legSwing * 15, 35);
    }

    private drawDyingStickMan(animationTime: number, bodyColor: number): void {
        // 頭
        this.graphics.beginFill(bodyColor);
        this.graphics.drawCircle(0, -20, 12);
        this.graphics.endFill();

        // 体（横倒れ）
        this.graphics.moveTo(0, -8);
        this.graphics.lineTo(20, 12);

        // 腕（横に伸ばしてピクピク）
        const armSwing = Math.sin(animationTime * 0.2) * 5;
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(-20 - armSwing, 0);
        this.graphics.moveTo(0, 0);
        this.graphics.lineTo(20 + armSwing, 0);

        // 脚（横に伸ばしてピクピク）
        const legSwing = Math.sin(animationTime * 0.2) * 5;
        this.graphics.moveTo(0, 12);
        this.graphics.lineTo(-20 - legSwing, 12);
        this.graphics.moveTo(0, 12);
        this.graphics.lineTo(20 + legSwing, 12);

        // 目（バッテン目）
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
    }

    public getPlayer(): PIXI.Container {
        return this.player;
    }
} 