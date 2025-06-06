import * as PIXI from 'pixi.js';
import { TEXT, SCREEN } from '../utils/constants';

export class UIManager {
    private screenText: PIXI.Text;
    private gameOverText: PIXI.Text;
    private gameClearText: PIXI.Text;
    private returnToTitleText: PIXI.Text;
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
    private comboHideTimer: number | null = null;
    private readonly COMBO_DISPLAY_TIME: number = 2000;  // コンボ表示時間（ミリ秒）
    private app: PIXI.Application;
    private isVisible: boolean = true;
    private scoreContainer: PIXI.Container;
    private highScoreContainer: PIXI.Container;
    private bonusScoreText: PIXI.Text;
    private isBonusScoreAdded: boolean = false;

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
        this.gameClearText.y = app.screen.height / 3;
        this.gameClearText.visible = false;

        // タイトルへ戻るテキストを作成
        this.returnToTitleText = new PIXI.Text('スペースキーを押してタイトルへ戻る', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE,
            fill: 0xFFFFFF,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'center'
        });
        this.returnToTitleText.anchor.set(0.5);
        this.returnToTitleText.x = app.screen.width / 2;
        this.returnToTitleText.y = app.screen.height * 2 / 3;
        this.returnToTitleText.visible = false;

        // ボーナススコア表示のテキストを作成
        this.bonusScoreText = new PIXI.Text('', {
            fontFamily: TEXT.SCREEN.FONT_FAMILY,
            fontSize: TEXT.SCREEN.FONT_SIZE + 8,
            fill: 0xFFFF00,
            stroke: TEXT.SCREEN.STROKE,
            strokeThickness: TEXT.SCREEN.STROKE_THICKNESS,
            align: 'center'
        });
        this.bonusScoreText.anchor.set(0.5);
        this.bonusScoreText.x = app.screen.width / 2;
        this.bonusScoreText.y = app.screen.height / 2;
        this.bonusScoreText.visible = false;

        // ハイスコアの読み込み
        this.loadHighScore();

        // レイヤー順に追加
        this.app.stage.addChild(this.scoreContainer);
        this.app.stage.addChild(this.highScoreContainer);
        this.app.stage.addChild(this.comboText);
        this.app.stage.addChild(this.gameOverText);
        this.app.stage.addChild(this.gameClearText);
        this.app.stage.addChild(this.returnToTitleText);
        this.app.stage.addChild(this.bonusScoreText);
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

    public addScore(points: number, isBonus: boolean = false): void {
        const currentTime = Date.now();
        
        // ボーナススコアの場合は、既に加算済みならスキップ
        if (isBonus && this.isBonusScoreAdded) {
            return;
        }
        
        // コンボの更新（ボーナススコアの場合はスキップ）
        if (!isBonus) {
            if (currentTime - this.lastScoreTime < this.COMBO_TIMEOUT) {
                this.comboCount++;
            } else {
                this.comboCount = 1;
            }
        }
        
        // スコアの計算と更新
        const comboBonus = isBonus ? 1 : Math.pow(1.5, this.comboCount - 1);
        const score = Math.floor(points * comboBonus);
        this.currentScore += score;
        
        // ボーナススコアの場合はフラグを設定
        if (isBonus) {
            this.isBonusScoreAdded = true;
        }
        
        // ハイスコアの更新
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
        }
        
        // スコア表示の更新
        this.updateScoreDisplay();
        if (!isBonus) {
            this.updateComboDisplay();
        }
        
        // 最終スコア時間の更新（ボーナススコアの場合はスキップ）
        if (!isBonus) {
            this.lastScoreTime = currentTime;
        }
    }

    private updateScoreDisplay(): void {
        this.scoreText.text = this.currentScore.toString();
        this.highScoreText.text = this.highScore.toString();
    }

    private updateComboDisplay(): void {
        if (this.comboCount > 1) {
            this.comboText.text = `${this.comboCount} Combo!`;
            this.comboText.visible = true;
            
            // 既存のタイマーをクリア
            if (this.comboHideTimer !== null) {
                clearTimeout(this.comboHideTimer);
            }
            
            // 新しいタイマーを設定
            this.comboHideTimer = setTimeout(() => {
                this.comboText.visible = false;
                this.comboHideTimer = null;
            }, this.COMBO_DISPLAY_TIME);
        } else {
            this.comboText.visible = false;
            if (this.comboHideTimer !== null) {
                clearTimeout(this.comboHideTimer);
                this.comboHideTimer = null;
            }
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
        this.returnToTitleText.visible = true;
    }

    public hideGameClear(): void {
        this.gameClearText.visible = false;
        this.returnToTitleText.visible = false;
        this.bonusScoreText.visible = false;
    }

    public showBonusScore(bonusScore: number): void {
        this.bonusScoreText.text = `ボーナススコア: ${bonusScore}点`;
        this.bonusScoreText.x = this.app.screen.width / 2;
        this.bonusScoreText.y = this.app.screen.height / 2;
        this.bonusScoreText.visible = true;
    }

    public resetScore(): void {
        this.currentScore = 0;
        this.comboCount = 0;
        this.updateScoreDisplay();
        this.updateComboDisplay();
    }

    public resetCombo(): void {
        this.comboCount = 0;
        this.comboText.visible = false;
        if (this.comboHideTimer !== null) {
            clearTimeout(this.comboHideTimer);
            this.comboHideTimer = null;
        }
    }

    public reset(): void {
        this.currentScreen = 1;
        this.screenText.text = `Screen: ${this.currentScreen}`;
        this.currentScore = 0;
        this.comboCount = 0;
        this.isBonusScoreAdded = false;  // ボーナススコアフラグをリセット
        this.updateScoreDisplay();
        this.comboText.visible = false;  // コンボ表示を確実に非表示に
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