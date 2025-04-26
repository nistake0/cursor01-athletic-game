import * as PIXI from 'pixi.js';
import { PLAYER, SCREEN, screenConfigs } from './utils/constants';
import { BackgroundRenderer } from './renderers/BackgroundRenderer';
import { UIManager } from './managers/UIManager';
import { EventEmitter, GameEvent } from './utils/EventEmitter';
import { PlayerManager } from './managers/PlayerManager';
import { ObstacleFactory } from './obstacles/ObstacleFactory';
import { Obstacle } from './obstacles/Obstacle';
import { LargePool } from './obstacles/LargePool';
import { WipeEffect } from './effects/WipeEffect';
import { EffectManager } from './effects/EffectManager';
import { TarzanRope } from './obstacles/TarzanRope';
import { BouncingRock } from './obstacles/BouncingRock';
import { GameStateManager } from './managers/GameStateManager';
import { GameStatus } from './types/GameState';
import { TitleScene } from './scenes/TitleScene';

export class Game {
    private app: PIXI.Application;
    private background: PIXI.Graphics;
    private obstacles: PIXI.Graphics;
    private currentScreen: number = 1;
    private backgroundRenderer: BackgroundRenderer;
    private eventEmitter: EventEmitter;
    private playerManager: PlayerManager;
    private uiManager: UIManager;
    private wipeEffect: WipeEffect;
    private isTransitioning: boolean = false;
    private effectManager: EffectManager;
    private lives: number = 3;  // 残機数
    private readonly MAX_LIVES: number = 3;  // 最大残機数
    private stateManager: GameStateManager;
    private titleScene: TitleScene;
    private isTitleScreen: boolean = true;
    
    // 新しい障害物管理用の変数
    public obstacleList: Obstacle[] = [];
    private obstacleFactory: ObstacleFactory;
    private targetScreen: number = 1;

    constructor() {
        // 状態管理を初期化
        this.stateManager = new GameStateManager();

        // PIXIアプリケーションを初期化
        this.app = new PIXI.Application({
            width: SCREEN.WIDTH,
            height: SCREEN.HEIGHT,
            backgroundColor: SCREEN.BACKGROUND_COLOR,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        // キャンバスをDOMに追加
        document.body.appendChild(this.app.view as HTMLCanvasElement);

        // イベントエミッターを初期化
        this.eventEmitter = new EventEmitter();

        // プレイヤーマネージャーを初期化
        this.playerManager = new PlayerManager(this.app, this, this.eventEmitter);

        // 背景を作成
        this.background = new PIXI.Graphics();
        this.app.stage.addChild(this.background);

        // 背景レンダラーを初期化
        this.backgroundRenderer = new BackgroundRenderer(this.app, this);
        this.backgroundRenderer.render();

        // 障害物を作成
        this.obstacles = new PIXI.Graphics();
        this.app.stage.addChild(this.obstacles);

        // UIマネージャーの初期化
        this.uiManager = new UIManager(this.app);

        // 障害物ファクトリを初期化
        this.obstacleFactory = new ObstacleFactory(this.app, this.obstacles, this);
        
        // ワイプ効果を初期化
        this.wipeEffect = new WipeEffect(this.app, () => this.completeTransition());
        
        // エフェクトマネージャーを初期化
        this.effectManager = new EffectManager(this.app);
        
        // プレイヤーの初期化
        this.playerManager.initializePlayer();
        
        // タイトル画面の初期化
        this.titleScene = new TitleScene();
        this.app.stage.addChild(this.titleScene.getContainer());
        this.titleScene.onStartButtonClick(() => this.startGame());
        
        // タイトル画面時はUIとプレイヤーを非表示
        this.uiManager.setVisible(false);
        this.playerManager.getPlayerOrThrow().visible = false;
        
        // 初期画面の障害物を設定
        this.initializeScreen(1);

        // イベントリスナーの設定
        this.setupEventListeners();

        // ゲームループを開始
        this.app.ticker.add(() => this.gameLoop());

        // 状態変更のリスナーを設定
        this.stateManager.onStateChange((event) => {
            if (event.type === 'STATUS_CHANGE') {
                if (event.newState.status === GameStatus.GAME_OVER) {
                    this.uiManager.showGameOver();
                } else if (event.newState.status === GameStatus.GAME_CLEAR) {
                    this.uiManager.showGameClear();
                    this.playerManager.onGameClear();
                }
            }
        });
    }

    private startGame(): void {
        this.isTitleScreen = false;
        this.titleScene.destroy();
        // プレイヤーマネージャーを再初期化
        this.playerManager = new PlayerManager(this.app, this, this.eventEmitter);
        this.playerManager.initializePlayer();
        // ゲーム開始時にUIとプレイヤーを表示
        this.uiManager.setVisible(true);
        const player = this.playerManager.getPlayerOrThrow();
        player.visible = true;
        // プレイヤーをobstaclesに追加
        const obstacles = this.getObstacles();
        if (!player.parent) {
            obstacles.addChild(player);
        }
        this.initializeScreen(1);
        this.gameLoop();
    }

    // プレイヤーの死亡処理を処理するメソッド
    public handlePlayerDeath(): void {
        this.decreaseLives();
        // プレーヤーの状態をリセット
        this.playerManager.reset();
    }

    // 残機を減らすメソッド
    private decreaseLives(): void {
        this.lives--;
        this.uiManager.updateLives(this.lives);
        
        if (this.lives <= 0) {
            // 残機が0になった場合はゲームオーバー
            this.gameOver();
        } else {
            // 残機が残っている場合は同じ画面をリスタート
            this.targetScreen = this.currentScreen;  // 同じ画面に戻るように設定
            this.startTransition();
        }
    }

    private setupEventListeners(): void {
        this.eventEmitter.on(GameEvent.NEXT_SCREEN, () => {
            if (this.stateManager.getStatus() !== GameStatus.GAME_OVER && !this.isTransitioning) {
                this.targetScreen = this.currentScreen + 1;
                this.startTransition();
            }
        });

        this.eventEmitter.on(GameEvent.SCREEN_TRANSITION, (amount: number) => {
            if (this.stateManager.getStatus() !== GameStatus.GAME_OVER && !this.isTransitioning) {
                this.targetScreen = this.currentScreen + amount;
                this.startTransition();
            }
        });

        // スペースキーの入力を処理
        this.eventEmitter.on(GameEvent.SPACE_KEY_PRESSED, () => {
            if (this.stateManager.getStatus() === GameStatus.GAME_CLEAR) {
                this.reset();
                this.isTitleScreen = true;
                this.titleScene = new TitleScene();
                this.app.stage.addChild(this.titleScene.getContainer());
                this.titleScene.onStartButtonClick(() => this.startGame());
                this.uiManager.setVisible(false);
            }
        });
    }

    private jumpToScreen(screenNumber: number): void {
        this.currentScreen = screenNumber - 1; // 次の画面に進むので-1する
        // プレーヤーの状態をリセット
        this.playerManager.reset();
        this.startTransition();
    }

    private startTransition(): void {
        // 既存の遷移をリセット
        if (this.isTransitioning) {
            this.wipeEffect.start();  // ワイプエフェクトを再開始
        }
        
        this.isTransitioning = true;
        this.playerManager.getPlayerOrThrow().visible = false;
        this.wipeEffect.start();
    }

    private completeTransition(): void {
        this.currentScreen = this.targetScreen;
        this.playerManager.getPlayerOrThrow().x = PLAYER.INITIAL_X;
        this.uiManager.updateScreenNumber(this.currentScreen);
        this.backgroundRenderer.setScreen(this.currentScreen);
        
        // 新しい画面の初期化
        this.initializeScreen(this.currentScreen);
        
        // 残機表示を更新
        this.uiManager.updateLives(this.lives);

        // プレーヤーをリセットして表示
        this.playerManager.reset();
        this.playerManager.getPlayerOrThrow().visible = true;
    }

    private drawObstacles(): void {
        this.obstacles.clear();
        
        // 描画優先度でソートして描画（数値が大きい順＝後ろから描画）
        this.obstacleList
            .sort((a, b) => b.getDrawPriority() - a.getDrawPriority())
            .forEach(obstacle => obstacle.draw());
    }

    private checkCollision(): boolean {
        const player = this.playerManager.getPlayerOrThrow() as PIXI.Graphics;
        
        // プレーヤーが死亡中なら衝突判定をスキップ
        if (this.playerManager.isDeadState()) {
            return false;
        }

        // すべての障害物との衝突をチェック
        for (const obstacle of this.obstacleList) {
            if (obstacle.checkCollision(player)) {
                // 衝突した場合
                this.playerManager.die();
                return true;
            }
        }

        return false;
    }

    public gameOver(): void {
        this.stateManager.setStatus(GameStatus.GAME_OVER);
        // ゲームオーバー後にタイトル画面に戻る
        setTimeout(() => {
            // プレイヤーを完全に破棄
            if (this.playerManager) {
                this.playerManager.destroy();
            }
            // ゲームの状態をリセット
            this.reset();
            // タイトル画面の初期化
            this.isTitleScreen = true;  // タイトル画面フラグを設定
            this.titleScene = new TitleScene();
            this.app.stage.addChild(this.titleScene.getContainer());
            this.titleScene.onStartButtonClick(() => this.startGame());
            this.uiManager.setVisible(false);
            // タイトル画面の状態を確実に反映
            this.app.ticker.addOnce(() => {
                console.log('Title screen state:', {
                    isTitleScreen: this.isTitleScreen,
                    hasPlayerManager: !!this.playerManager
                });
            });
        }, 2000); // 2秒後にタイトル画面に戻る
    }

    public gameClear(): void {
        this.stateManager.setStatus(GameStatus.GAME_CLEAR);
        
        // 残機数×1000点のスコアを加算（コンボなし）
        const bonusScore = this.lives * 1000;
        this.uiManager.addScore(bonusScore, true);
        
        // ボーナススコアの表示
        this.uiManager.showBonusScore(bonusScore);
    }

    private initializeScreen(screenNumber: number): void {
        // 既存の障害物をクリア
        this.obstacleList.forEach(obstacle => obstacle.reset());
        this.obstacleList = [];
        
        // 新しい画面の障害物を生成
        const screenConfig = screenConfigs[screenNumber];
        if (screenConfig) {
            this.obstacleList = this.obstacleFactory.createObstacles(screenConfig.obstacles);
        }
        
        // 背景を設定
        this.backgroundRenderer.setScreen(screenNumber);
        
        // 障害物を描画
        this.drawObstacles();
    }

    private reset(): void {
        this.stateManager.setStatus(GameStatus.PLAYING);
        this.currentScreen = 1;
        this.lives = this.MAX_LIVES;
        // プレイヤーマネージャーがnullの場合のみ新しいインスタンスを作成
        if (!this.playerManager) {
            this.playerManager = new PlayerManager(this.app, this, this.eventEmitter);
            this.playerManager.initializePlayer();  // プレイヤーを初期化
        }
        this.uiManager.updateScreenNumber(this.currentScreen);
        this.uiManager.updateLives(this.lives);
        this.uiManager.resetScore();  // スコアをリセット
        this.backgroundRenderer.setScreen(1);
        this.initializeScreen(1);
        this.uiManager.hideGameOver();
        this.uiManager.hideGameClear();
    }

    private gameLoop(): void {
        if (this.isTitleScreen) {
            // タイトル画面時はプレイヤーを非表示にする
            if (this.playerManager) {
                const player = this.playerManager.getPlayer();
                if (player && player.parent) {
                    player.parent.removeChild(player);
                }
            }
            this.titleScene.update(1/60);
            return;
        }

        if (this.stateManager.getStatus() === GameStatus.GAME_OVER) {  // ゲームオーバー時のみ更新を停止
            return;
        }

        if (this.isTransitioning) {
            // ワイプエフェクトの更新
            this.wipeEffect.update();
            this.effectManager.update();
            
            // トランジション完了チェック
            if (!this.wipeEffect.isActive()) {
                this.isTransitioning = false;  // ここでトランジション完了フラグをリセット
                // トランジション完了後にプレーヤーを表示
                this.playerManager.getPlayerOrThrow().visible = true;
            }
            return;
        }

        // プレーヤーの更新（死亡中も含む）
        this.playerManager.update();

        // 現在の時間を取得
        const currentTime = Date.now();
            
        // すべての障害物を更新
        this.obstacleList.forEach(obstacle => obstacle.update(currentTime));

        // エフェクトの更新
        this.effectManager.update();

        // 障害物との衝突判定（死亡中はスキップ）
        if (!this.playerManager.isDeadState() && 
            this.stateManager.getStatus() !== GameStatus.GAME_CLEAR && 
            this.checkCollision()) {
            this.playerManager.die();  // 衝突時にプレイヤーを死亡状態にする
        }

        // 障害物の再描画
        this.drawObstacles();

        // ゲームクリア画面の判定
        const screenConfig = screenConfigs[this.currentScreen];
        if (screenConfig?.isGameClearScreen) {
            const player = this.playerManager.getPlayerOrThrow();
            if (player.x >= SCREEN.WIDTH / 2) {
                this.gameClear();
            }
        }
    }

    public getPlayer(): PIXI.Container {
        return this.playerManager.getPlayerOrThrow();
    }

    public getVelocityY(): number {
        return this.playerManager.getVelocityY();
    }

    public setVelocityY(value: number): void {
        this.playerManager.setVelocityY(value);
    }

    public setGrounded(value: boolean): void {
        this.playerManager.setGrounded(value);
    }

    public isGrounded(): boolean {
        return this.playerManager.isGroundedState();
    }

    public getPlayerDirection(): number {
        return this.playerManager.getDirection();
    }

    public isPlayerMoving(): boolean {
        return this.playerManager.isMovingState();
    }

    public getPlayerAnimationTime(): number {
        return this.playerManager.getAnimationTime();
    }

    public getGameOverState(): boolean {
        return this.stateManager.getStatus() === GameStatus.GAME_OVER;
    }

    public getGameClearState(): boolean {
        return this.stateManager.getStatus() === GameStatus.GAME_CLEAR;
    }

    public setPlayerPosition(x: number, y: number): void {
        this.playerManager.setPlayerPosition(x, y);
    }

    public getPlayerManager(): PlayerManager {
        return this.playerManager;
    }

    public getApp(): PIXI.Application {
        return this.app;
    }

    public getLargePoolBounds(): { x: number; y: number; width: number; height: number } {
        const largePool = this.obstacleList.find(obstacle => obstacle instanceof LargePool) as LargePool;
        return largePool ? largePool.getPoolBounds() : { x: 0, y: 0, width: 0, height: 0 };
    }

    public getEffectManager(): EffectManager {
        return this.effectManager;
    }

    public getObstacles(): PIXI.Graphics {
        return this.obstacles;
    }

    public getUIManager(): UIManager {
        return this.uiManager;
    }

    public getIsTitleScreen(): boolean {
        return this.isTitleScreen;
    }
}

// ゲームの開始
window.onload = () => {
    new Game();
}; 