import * as PIXI from 'pixi.js';
import { Game } from './game';
import { Obstacle } from './Obstacle';

export class Rock extends Obstacle {
    private player: PIXI.Graphics;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.player = game.getPlayer();
    }

    // 岩の描画処理
    public draw(): void {
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
    }

    // 岩との衝突判定
    public checkCollision(player: PIXI.Graphics): boolean {
        const playerBounds = {
            left: player.x - 15,
            right: player.x + 15,
            top: player.y - 35,
            bottom: player.y
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
    public update(currentTime: number): void {
        // 画面7では岩が動くようにする
        // 岩の位置を少し上下に揺らす
        const rockY = this.app.screen.height - 100 + Math.sin(currentTime) * 5;
        
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

    // 岩のリセット処理
    public reset(): void {
        // 岩を再描画
        this.draw();
    }
} 