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

        // 岩の位置を取得（updateメソッドで動かした場合の位置を考慮）
        const time = Date.now() / 1000;
        const rockY = this.app.screen.height - 100 + Math.sin(time) * 5;
        
        const rockBounds = {
            left: 400,
            right: 460,
            top: rockY - 40, // 岩の高さを考慮
            bottom: rockY
        };

        return !(playerBounds.right < rockBounds.left || 
                playerBounds.left > rockBounds.right || 
                playerBounds.bottom < rockBounds.top || 
                playerBounds.top > rockBounds.bottom);
    }

    // 岩の更新処理
    public update(): void {
        // 画面7では岩が動くようにする
        // 岩の位置を少し上下に揺らす
        const time = Date.now() / 1000;
        const rockY = this.app.screen.height - 100 + Math.sin(time) * 5;
        
        // 岩を再描画
        this.obstacles.clear();
        this.obstacles.beginFill(0x808080);
        this.obstacles.lineStyle(2, 0x000000);
        
        const rockX = 400;
        const rockWidth = 60;
        const rockHeight = 40;
        
        this.obstacles.moveTo(rockX, rockY);
        this.obstacles.lineTo(rockX + rockWidth, rockY);
        this.obstacles.lineTo(rockX + rockWidth - 10, rockY - rockHeight);
        this.obstacles.lineTo(rockX + 10, rockY - rockHeight);
        this.obstacles.lineTo(rockX, rockY);
        this.obstacles.endFill();
    }
} 