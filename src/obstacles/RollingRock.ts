import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from '../obstacles/Obstacle';

export class RollingRock extends Obstacle {
    private player: PIXI.Container;
    private rockX: number;
    private speed: number;
    private rockRotation: number;
    private rock: PIXI.Graphics;
    private irregularLines: { startX: number; startY: number; endX: number; endY: number }[] = [];
    private surfaceLines: { startX: number; startY: number; endX: number; endY: number }[] = [];
    private surfaceBumps: { x: number; y: number; size: number }[] = [];

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.player = game.getPlayer();
        this.rockX = app.screen.width + 50;
        this.speed = 4;
        this.rockRotation = 0;
        
        // 岩のGraphicsオブジェクトを一度だけ作成
        this.rock = new PIXI.Graphics();
        this.obstacles.addChild(this.rock);
        
        // 不規則な要素を初期化時に生成
        this.generateIrregularLines();
        this.generateSurfaceLines();
        this.generateSurfaceBumps();
    }
    
    // 不規則な線を生成するメソッド
    private generateIrregularLines(): void {
        this.irregularLines = [];
        
        // 内側の不規則な線を生成
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const nextAngle = ((i + 1) / 12) * Math.PI * 2;
            
            // 内側に不規則な線を描画
            const innerRadius = 35 + Math.random() * 5;
            const startX = Math.cos(angle) * innerRadius;
            const startY = Math.sin(angle) * innerRadius;
            const endX = Math.cos(nextAngle) * innerRadius;
            const endY = Math.sin(nextAngle) * innerRadius;
            
            this.irregularLines.push({ startX, startY, endX, endY });
        }
    }
    
    // 表面の線を生成するメソッド
    private generateSurfaceLines(): void {
        this.surfaceLines = [];
        
        // 不規則な線で表面の凹凸を表現
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 25 + Math.random() * 10;
            const startX = Math.cos(angle) * radius;
            const startY = Math.sin(angle) * radius;
            const endX = Math.cos(angle + Math.PI / 4) * radius;
            const endY = Math.sin(angle + Math.PI / 4) * radius;
            
            this.surfaceLines.push({ startX, startY, endX, endY });
        }
    }
    
    // 表面の凹凸を生成するメソッド
    private generateSurfaceBumps(): void {
        this.surfaceBumps = [];
        
        // 岩の表面に小さな凹凸を追加
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 15;
            const size = 2 + Math.random() * 3;
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            this.surfaceBumps.push({ x, y, size });
        }
    }

    // 転がる岩の描画処理
    public draw(): void {
        const rockCenterX = this.rockX;
        const rockCenterY = this.app.screen.height - 115;
        
        // 既存のGraphicsオブジェクトをクリア
        this.rock.clear();
        
        // 岩の本体（ごつごつした円形）
        this.rock.beginFill(0x808080);
        this.rock.lineStyle(2, 0x000000);
        
        // 基本の円形を描画
        this.rock.drawCircle(0, 0, 40);
        
        // 表面の凹凸を追加（不規則な線）
        this.rock.lineStyle(1, 0x000000);
        
        // 初期化時に生成した不規則な線を描画
        for (const line of this.irregularLines) {
            this.rock.moveTo(line.startX, line.startY);
            this.rock.lineTo(line.endX, line.endY);
        }
        
        this.rock.endFill();
        
        // 岩の質感を表現する線と影
        // 暗い部分（影）
        this.rock.lineStyle(2, 0x404040);
        this.rock.arc(0, 0, 35, 0, Math.PI, false);
        
        // 明るい部分（ハイライト）
        this.rock.lineStyle(2, 0xA0A0A0);
        this.rock.arc(0, 0, 30, Math.PI, 2 * Math.PI, false);
        
        // 表面の凹凸を表現する線
        this.rock.lineStyle(1, 0x606060);
        
        // 初期化時に生成した表面の線を描画
        for (const line of this.surfaceLines) {
            this.rock.moveTo(line.startX, line.startY);
            this.rock.lineTo(line.endX, line.endY);
        }
        
        // 初期化時に生成した表面の凹凸を描画
        for (const bump of this.surfaceBumps) {
            this.rock.beginFill(0x707070);
            this.rock.drawCircle(bump.x, bump.y, bump.size);
            this.rock.endFill();
        }
        
        // 回転と位置を設定
        this.rock.position.set(rockCenterX, rockCenterY);
        this.rock.rotation = this.rockRotation;
    }

    // 転がる岩との衝突判定
    public checkCollision(player: PIXI.Graphics): boolean {
        const playerBounds = {
            left: player.x - 15,
            right: player.x + 15,
            top: player.y - 35,
            bottom: player.y
        };

        const rockBounds = {
            left: this.rockX - 35,
            right: this.rockX + 35,
            top: this.app.screen.height - 150,
            bottom: this.app.screen.height - 100
        };

        // プレイヤーが岩を飛び越えたかチェック
        if (player.x > rockBounds.right && player.y < rockBounds.top) {
            this.addScore(20);
        }

        return !(playerBounds.right < rockBounds.left || 
                playerBounds.left > rockBounds.right || 
                playerBounds.bottom < rockBounds.top || 
                playerBounds.top > rockBounds.bottom);
    }

    // 転がる岩の更新処理
    public update(currentTime: number): void {
        this.rockX -= this.speed;
        this.rockRotation -= 0.1; // 回転速度を元に戻す
        
        // 岩が画面外に出たら右端に戻す
        if (this.rockX < -50) {
            this.rockX = this.app.screen.width + 50;
        }
    }

    // 転がる岩のリセット処理
    public reset(): void {
        this.rockX = this.app.screen.width + 50;
        this.rockRotation = 0;
        this.rock.clear();
    }
} 