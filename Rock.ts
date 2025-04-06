import * as PIXI from 'pixi.js';

export class Rock {
    private app: PIXI.Application;
    private obstacles: PIXI.Graphics;
    private player: PIXI.Graphics;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, player: PIXI.Graphics) {
        this.app = app;
        this.obstacles = obstacles;
        this.player = player;
    }

    // 岩の描画処理
    public draw(): PIXI.Graphics {
        this.obstacles.beginFill(0x808080);
        this.obstacles.lineStyle(2, 0x000000);
        
        const rockX = 400;
        const rockY = this.app.screen.height - 100; // 位置を下げる
        const rockWidth = 60;
        const rockHeight = 40;
        
        this.obstacles.moveTo(rockX, rockY);
        this.obstacles.lineTo(rockX + rockWidth, rockY);
        this.obstacles.lineTo(rockX + rockWidth - 10, rockY - rockHeight);
        this.obstacles.lineTo(rockX + 10, rockY - rockHeight);
        this.obstacles.lineTo(rockX, rockY);
        this.obstacles.endFill();
        
        return this.obstacles;
    }

    // 岩との衝突判定
    public checkCollision(): boolean {
        const playerBounds = {
            left: this.player.x - 15,
            right: this.player.x + 15,
            top: this.player.y - 35,
            bottom: this.player.y
        };

        const rockBounds = {
            left: 400,
            right: 460,
            top: this.app.screen.height - 140, // 位置調整に合わせて更新
            bottom: this.app.screen.height - 100
        };

        return !(playerBounds.right < rockBounds.left || 
                playerBounds.left > rockBounds.right || 
                playerBounds.bottom < rockBounds.top || 
                playerBounds.top > rockBounds.bottom);
    }

    // 岩の更新処理（必要に応じて）
    public update(): void {
        // 画面2の岩は動かないので、現時点では何もしない
        // 将来的に岩が動くようになった場合に実装
    }
} 