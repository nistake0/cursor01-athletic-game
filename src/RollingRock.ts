import * as PIXI from 'pixi.js';

export class RollingRock {
    private app: PIXI.Application;
    private obstacles: PIXI.Graphics;
    private player: PIXI.Graphics;
    private x: number;
    private speed: number;
    private rotation: number;
    private rock: PIXI.Graphics;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, player: PIXI.Graphics) {
        this.app = app;
        this.obstacles = obstacles;
        this.player = player;
        this.x = app.screen.width + 50;
        this.speed = 4;
        this.rotation = 0;
        
        // 岩のGraphicsオブジェクトを一度だけ作成
        this.rock = new PIXI.Graphics();
        this.obstacles.addChild(this.rock);
    }

    // 転がる岩の描画処理
    public draw(): PIXI.Graphics {
        const rockCenterX = this.x;
        const rockCenterY = this.app.screen.height - 115;
        
        // 既存のGraphicsオブジェクトをクリア
        this.rock.clear();
        
        // 石の本体（不規則な形状）
        this.rock.beginFill(0x808080);
        this.rock.lineStyle(2, 0x000000);
        
        // 不規則な岩の形を描画（原点中心）
        this.rock.moveTo(-30, 15);
        this.rock.lineTo(-35, 0);
        this.rock.lineTo(-30, -20);
        this.rock.lineTo(-15, -35);
        this.rock.lineTo(15, -35);
        this.rock.lineTo(30, -20);
        this.rock.lineTo(35, 0);
        this.rock.lineTo(30, 15);
        this.rock.lineTo(-30, 15);
        
        this.rock.endFill();
        
        // 岩の質感を表現する線
        this.rock.lineStyle(2, 0x666666);
        // 横線（不規則）
        this.rock.moveTo(-25, -20);
        this.rock.lineTo(25, -15);
        
        this.rock.moveTo(-28, 0);
        this.rock.lineTo(28, 5);
        
        this.rock.moveTo(-20, 10);
        this.rock.lineTo(20, 8);
        
        // 斜めの線で立体感を出す
        this.rock.moveTo(-15, -25);
        this.rock.lineTo(-5, 10);

        // 回転と位置を設定
        this.rock.position.set(rockCenterX, rockCenterY);
        this.rock.rotation = this.rotation;
        
        return this.obstacles;
    }

    // 転がる岩との衝突判定
    public checkCollision(): boolean {
        const playerBounds = {
            left: this.player.x - 15,
            right: this.player.x + 15,
            top: this.player.y - 35,
            bottom: this.player.y
        };

        const rockBounds = {
            left: this.x - 35,
            right: this.x + 35,
            top: this.app.screen.height - 150,
            bottom: this.app.screen.height - 100
        };

        return !(playerBounds.right < rockBounds.left || 
                playerBounds.left > rockBounds.right || 
                playerBounds.bottom < rockBounds.top || 
                playerBounds.top > rockBounds.bottom);
    }

    // 転がる岩の更新処理
    public update(currentTime: number): void {
        this.x -= this.speed;
        this.rotation -= 0.1;
        
        // 岩が画面外に出たら右端に戻す
        if (this.x < -50) {
            this.x = this.app.screen.width + 50;
        }
    }

    // 転がる岩のリセット処理
    public reset(): void {
        this.x = this.app.screen.width + 50;
        this.rotation = 0;
        this.rock.clear();
    }
} 