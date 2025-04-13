import * as PIXI from 'pixi.js';
import { TEXT, SCREEN } from '../utils/constants';

export class UIManager {
    private screenText: PIXI.Text;
    private gameOverText: PIXI.Text;
    private scoreText!: PIXI.Text;
    private highScoreText!: PIXI.Text;
    private comboText: PIXI.Text;
    private currentScreen: number = 1;
    private currentScore: number = 0;
    private highScore: number = 0;
    private comboCount: number = 0;
    private app: PIXI.Application;

    constructor(app: PIXI.Application) {
        this.app = app;
        
        // 画面番号テキストを作成
        this.screenText = new PIXI.Text(`Screen: ${this.currentScreen}`, {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE,
            fill: TEXT.SCREEN.FILL,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS
        });
        this.screenText.x = 20;
        this.screenText.y = 20;

        // スコア表示用のコンテナを作成
        const scoreContainer = new PIXI.Container();
        scoreContainer.x = SCREEN.WIDTH - 20; // 右端から20pxの位置
        scoreContainer.y = 20;

        // スコアラベル
        const scoreLabel = new PIXI.Text('SCORE', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE,
            fill: TEXT.SCREEN.FILL,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'right'
        });
        scoreLabel.anchor.set(1, 0); // 右端を基準点に
        scoreContainer.addChild(scoreLabel);

        // スコア数値
        this.scoreText = new PIXI.Text('0', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE + 8,
            fill: TEXT.SCREEN.FILL,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'right'
        });
        this.scoreText.anchor.set(1, 0); // 右端を基準点に
        this.scoreText.y = 30;
        scoreContainer.addChild(this.scoreText);

        // ハイスコア表示用のコンテナを作成
        const highScoreContainer = new PIXI.Container();
        highScoreContainer.x = SCREEN.WIDTH - 20; // 右端から20pxの位置
        highScoreContainer.y = 100; // スコア表示の下に配置（80から100に変更）

        // ハイスコアラベル
        const highScoreLabel = new PIXI.Text('HIGH SCORE', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE - 4, // フォントサイズを小さく
            fill: 0xFFFF00,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'right'
        });
        highScoreLabel.anchor.set(1, 0); // 右端を基準点に
        highScoreContainer.addChild(highScoreLabel);

        // ハイスコア数値
        this.highScoreText = new PIXI.Text('0', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE + 4, // スコアより少し小さく
            fill: 0xFFFF00,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'right'
        });
        this.highScoreText.anchor.set(1, 0); // 右端を基準点に
        this.highScoreText.y = 25; // ラベルとの間隔を調整
        highScoreContainer.addChild(this.highScoreText);

        // コンボテキストを作成（初期状態は非表示）
        this.comboText = new PIXI.Text('', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE + 4,
            fill: 0xFF0000,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'center'
        });
        this.comboText.anchor.set(0.5);
        this.comboText.x = SCREEN.WIDTH / 2;
        this.comboText.y = 100;
        this.comboText.visible = false;

        // ゲームオーバーテキストを作成（初期状態は非表示）
        this.gameOverText = new PIXI.Text('GAME OVER', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE + 16,
            fill: 0xFF0000,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'center'
        });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.x = app.screen.width / 2;
        this.gameOverText.y = app.screen.height / 2;
        this.gameOverText.visible = false;

        // ハイスコアの読み込み
        this.loadHighScore();

        // レイヤー順に追加
        app.stage.addChild(this.screenText);
        app.stage.addChild(scoreContainer);
        app.stage.addChild(highScoreContainer);
        app.stage.addChild(this.comboText);
        app.stage.addChild(this.gameOverText);
    }

    public updateScreenNumber(screenNumber: number): void {
        this.currentScreen = screenNumber;
        this.screenText.text = `Screen: ${this.currentScreen}`;
    }

    public addScore(points: number, isCombo: boolean = false): void {
        // 基本スコアの加算
        this.currentScore += points;
        
        // コンボ処理
        if (isCombo) {
            this.comboCount++;
            // コンボボーナスの計算
            const comboBonus = Math.floor(points * (this.comboCount * 0.1));
            this.currentScore += comboBonus;
        } else {
            this.comboCount = 0;
        }
        
        // ハイスコアの更新
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
        
        // スコア表示の更新
        this.updateScoreDisplay();
        
        // コンボ表示の更新
        this.updateComboDisplay();
    }

    private updateScoreDisplay(): void {
        this.scoreText.text = this.currentScore.toString();
        this.highScoreText.text = this.highScore.toString();
    }

    private updateComboDisplay(): void {
        if (this.comboCount > 1) {
            this.comboText.text = `${this.comboCount} Combo!`;
            this.comboText.visible = true;
        } else {
            this.comboText.visible = false;
        }
    }

    private saveHighScore(): void {
        try {
            localStorage.setItem('highScore', this.highScore.toString());
        } catch (e) {
            console.error('Failed to save high score:', e);
        }
    }

    private loadHighScore(): void {
        try {
            const savedHighScore = localStorage.getItem('highScore');
            if (savedHighScore) {
                this.highScore = parseInt(savedHighScore, 10);
                this.highScoreText.text = this.highScore.toString();
            }
        } catch (e) {
            console.error('Failed to load high score:', e);
        }
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
        this.currentScore = 0;
        this.comboCount = 0;
        this.updateScoreDisplay();
        this.updateComboDisplay();
        this.hideGameOver();
    }
} 