import * as PIXI from 'pixi.js';
import { TEXT, SCREEN } from '../utils/constants';

export class UIManager {
    private screenText: PIXI.Text;
    private gameOverText: PIXI.Text;
    private gameClearText: PIXI.Text;
    private scoreText!: PIXI.Text;
    private highScoreText!: PIXI.Text;
    private comboText: PIXI.Text;
    private livesText: PIXI.Text;
    private currentScreen: number = 1;
    private currentScore: number = 0;
    private highScore: number = 0;
    private comboCount: number = 0;
    private readonly COMBO_TIMEOUT: number = 3000;
    private lastScoreTime: number = 0;
    private app: PIXI.Application;
    private isVisible: boolean = true;
    private scoreContainer: PIXI.Container;
    private highScoreContainer: PIXI.Container;

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
        this.app.stage.addChild(this.screenText);

        // スコア表示用のコンテナを作成
        this.scoreContainer = new PIXI.Container();
        this.scoreContainer.x = SCREEN.WIDTH - 20;
        this.scoreContainer.y = 20;

        // スコアラベル
        const scoreLabel = new PIXI.Text('SCORE', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE,
            fill: TEXT.SCREEN.FILL,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'right'
        });
        scoreLabel.anchor.set(1, 0);
        this.scoreContainer.addChild(scoreLabel);

        // スコア数値
        this.scoreText = new PIXI.Text('0', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE + 8,
            fill: TEXT.SCREEN.FILL,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'right'
        });
        this.scoreText.anchor.set(1, 0);
        this.scoreText.y = 30;
        this.scoreContainer.addChild(this.scoreText);

        // ハイスコア表示用のコンテナを作成
        this.highScoreContainer = new PIXI.Container();
        this.highScoreContainer.x = SCREEN.WIDTH - 20;
        this.highScoreContainer.y = 100;

        // ハイスコアラベル
        const highScoreLabel = new PIXI.Text('HIGH SCORE', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE - 4,
            fill: 0xFFFF00,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'right'
        });
        highScoreLabel.anchor.set(1, 0);
        this.highScoreContainer.addChild(highScoreLabel);

        // ハイスコア数値
        this.highScoreText = new PIXI.Text('0', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE + 4,
            fill: 0xFFFF00,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'right'
        });
        this.highScoreText.anchor.set(1, 0);
        this.highScoreText.y = 25;
        this.highScoreContainer.addChild(this.highScoreText);

        // コンボテキストを作成
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

        // 残機表示テキストを作成
        this.livesText = new PIXI.Text(`Lives: ${3}`, {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE,
            fill: TEXT.SCREEN.FILL,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS
        });
        this.livesText.x = 20;
        this.livesText.y = 50;
        this.app.stage.addChild(this.livesText);

        // ゲームオーバーテキストを作成
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

        // ゲームクリアテキストを作成
        this.gameClearText = new PIXI.Text('GAME CLEAR!', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE + 24,
            fill: 0xFFFF00,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'center'
        });
        this.gameClearText.anchor.set(0.5);
        this.gameClearText.x = app.screen.width / 2;
        this.gameClearText.y = app.screen.height / 2;
        this.gameClearText.visible = false;

        // ハイスコアの読み込み
        this.loadHighScore();

        // レイヤー順に追加
        this.app.stage.addChild(this.scoreContainer);
        this.app.stage.addChild(this.highScoreContainer);
        this.app.stage.addChild(this.comboText);
        this.app.stage.addChild(this.gameOverText);
        this.app.stage.addChild(this.gameClearText);
    }

    public updateScreenNumber(screenNumber: number): void {
        this.currentScreen = screenNumber;
        this.screenText.text = `Screen: ${this.currentScreen}`;
    }

    public updateLives(lives: number): void {
        // 残機が0の場合は必ず0を表示
        const displayLives = Math.max(0, lives);
        this.livesText.text = `Lives: ${displayLives}`;
        
        // 残機が0の場合は赤色に変更
        if (displayLives === 0) {
            this.livesText.style.fill = 0xFF0000;
        } else {
            this.livesText.style.fill = 0xFFFFFF;
        }
    }

    public addScore(points: number): void {
        const currentTime = Date.now();
        
        // コンボの更新
        if (currentTime - this.lastScoreTime < this.COMBO_TIMEOUT) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }
        
        // スコアの計算と更新
        const comboBonus = Math.pow(1.5, this.comboCount - 1);
        const score = Math.floor(points * comboBonus);
        this.currentScore += score;
        
        // ハイスコアの更新
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
        
        // スコア表示の更新
        this.updateScoreDisplay();
        this.updateComboDisplay();
        
        // 最終スコア時間を更新
        this.lastScoreTime = currentTime;
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

    public showGameClear(): void {
        this.gameClearText.visible = true;
    }

    public hideGameClear(): void {
        this.gameClearText.visible = false;
    }

    public reset(): void {
        this.currentScreen = 1;
        this.screenText.text = `Screen: ${this.currentScreen}`;
        this.currentScore = 0;
        this.comboCount = 0;
        this.updateScoreDisplay();
        this.updateComboDisplay();
        this.updateLives(3);  // 残機を3にリセット
        this.hideGameOver();
    }

    public setVisible(visible: boolean): void {
        this.isVisible = visible;
        this.screenText.visible = visible;
        this.livesText.visible = visible;
        this.scoreContainer.visible = visible;
        this.highScoreContainer.visible = visible;
        this.comboText.visible = visible;
    }
} 