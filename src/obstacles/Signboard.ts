import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';

export class Signboard extends Obstacle {
    private isInitialized: boolean = false;
    private cursorText: PIXI.Text;
    private parkText: PIXI.Text;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.drawPriority = 1;  // 看板は最前面に描画
        
        // テキストスタイルの設定
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fontWeight: 'bold',
            fill: '#000000',
            align: 'center'
        });
        
        // テキストの作成
        this.cursorText = new PIXI.Text('CURSOR', textStyle);
        this.parkText = new PIXI.Text('PARK', textStyle);
        
        // テキストの位置設定（中央揃え）
        this.cursorText.anchor.set(0.5, 0.5);
        this.parkText.anchor.set(0.5, 0.5);
        
        // 看板の中心位置
        const signboardCenterX = 400; // 看板の中心X座標 (200 + 400/2)
        const signboardCenterY = 300; // 看板の中心Y座標 (200 + 200/2)
        
        // テキストの位置を看板の中心に設定
        this.cursorText.x = signboardCenterX;
        this.cursorText.y = signboardCenterY - 30; // 上部に配置
        this.parkText.x = signboardCenterX;
        this.parkText.y = signboardCenterY + 30; // 下部に配置
        
        // テキストをステージに追加
        this.app.stage.addChild(this.cursorText);
        this.app.stage.addChild(this.parkText);
    }

    public draw(): void {
        if (!this.isInitialized) {
            this.isInitialized = true;
        }

        // 看板の背景（茶色の木）
        this.obstacles.beginFill(0x8B4513);
        this.obstacles.lineStyle(2, 0x654321);
        
        // 看板の本体
        this.obstacles.drawRect(200, 200, 400, 200);
        
        // 看板の支柱
        this.obstacles.drawRect(200, 400, 20, 100);
        this.obstacles.drawRect(580, 400, 20, 100);
        
        // 看板の文字（白色）
        this.obstacles.beginFill(0xFFFFFF);
        this.obstacles.drawRect(220, 220, 360, 160);
    }

    public update(currentTime: number): void {
        // 看板は動かないので何もしない
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        // 看板は衝突しないので常にfalseを返す
        return false;
    }

    public reset(): void {
        this.isInitialized = false;
    }
} 