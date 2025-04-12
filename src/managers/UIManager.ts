import * as PIXI from 'pixi.js';
import { TEXT } from '../utils/constants';

export class UIManager {
    private screenText: PIXI.Text;
    private gameOverText: PIXI.Text;
    private currentScreen: number = 1;

    constructor(app: PIXI.Application) {
        // 画面番号テキストを作成
        this.screenText = new PIXI.Text(`Screen: ${this.currentScreen}`, {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE,
            fill: TEXT.SCREEN.FILL,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'center'
        });
        this.screenText.x = 20;
        this.screenText.y = 20;

        // ゲームオーバーテキストを作成（初期状態は非表示）
        this.gameOverText = new PIXI.Text('GAME OVER\nPress SPACE to restart', {
            fontFamily: TEXT.GAME_OVER.FONT_FAMILY,
            fontSize: TEXT.GAME_OVER.FONT_SIZE,
            fill: TEXT.GAME_OVER.FILL,
            stroke: TEXT.GAME_OVER.STROKE,
            strokeThickness: TEXT.GAME_OVER.STROKE_THICKNESS,
            align: 'center'
        });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.x = app.screen.width / 2;
        this.gameOverText.y = app.screen.height / 2;
        this.gameOverText.visible = false;

        // レイヤー順に追加
        app.stage.addChild(this.screenText);
        app.stage.addChild(this.gameOverText);
    }

    public updateScreenNumber(screenNumber: number): void {
        this.currentScreen = screenNumber;
        this.screenText.text = `Screen: ${this.currentScreen}`;
    }

    public showGameOver(): void {
        this.gameOverText.visible = true;
    }

    public hideGameOver(): void {
        this.gameOverText.visible = false;
    }

    public reset(): void {
        this.currentScreen = 1;
        this.screenText.text = `Screen: ${this.currentScreen}`;
        this.hideGameOver();
    }
} 