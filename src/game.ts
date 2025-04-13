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

export class Game {
    private app: PIXI.Application;
    private background: PIXI.Graphics;
    private obstacles: PIXI.Graphics;
    private currentScreen: number = 1;
    private isGameOver: boolean = false;
    private backgroundRenderer: BackgroundRenderer;
    private eventEmitter: EventEmitter;
    private playerManager: PlayerManager;
    private uiManager: UIManager;
    private wipeEffect: WipeEffect;
    private isTransitioning: boolean = false;
    private effectManager: EffectManager;
    
    // 新しい障害物管理用の変数
    public obstacleList: Obstacle[] = [];
    private obstacleFactory: ObstacleFactory;

    constructor() {
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
        
        // 初期画面の障害物を設定
        this.initializeScreen(1);

        // イベントリスナーの設定
        this.setupEventListeners();
        this.setupKeyboardEvents();

        // ゲームループを開始
        this.app.ticker.add(() => this.gameLoop());
    }

    private setupEventListeners(): void {
        this.eventEmitter.on(GameEvent.RESTART, () => {
            if (this.isGameOver) {
                this.reset();
            }
        });

        this.eventEmitter.on(GameEvent.NEXT_SCREEN, () => {
            if (!this.isGameOver && !this.isTransitioning) {
                this.startTransition();
            }
        });
    }

    private setupKeyboardEvents(): void {
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            if (this.isGameOver || this.isTransitioning) return;

            switch (event.key) {
                case 'Escape':
                    this.startTransition();
                    break;
                case '1':
                    this.jumpToScreen(10);
                    break;
            }
        });
    }

    private jumpToScreen(screenNumber: number): void {
        this.currentScreen = screenNumber - 1; // 次の画面に進むので-1する
        this.startTransition();
    }

    private startTransition(): void {
        this.isTransitioning = true;
        this.playerManager.getPlayer().visible = false;
        this.wipeEffect.start();
    }

    private completeTransition(): void {
        this.currentScreen++;
        this.playerManager.getPlayer().x = PLAYER.INITIAL_X;
        this.uiManager.updateScreenNumber(this.currentScreen);
        this.backgroundRenderer.setScreen(this.currentScreen);
        
        // 新しい画面の初期化
        this.initializeScreen(this.currentScreen);
        
        // ワイプ効果は自動的にフェードインします
    }

    private drawObstacles(): void {
        this.obstacles.clear();
        
        // 描画優先度でソートして描画（数値が大きい順＝後ろから描画）
        this.obstacleList
            .sort((a, b) => b.getDrawPriority() - a.getDrawPriority())
            .forEach(obstacle => obstacle.draw());
    }

    private checkCollision(): boolean {
        const player = this.playerManager.getPlayer();
        
        // プレーヤーが死亡中なら衝突判定をスキップ
        if (this.playerManager.isDead()) {
            return false;
        }

        // すべての障害物との衝突をチェック
        const result = this.obstacleList.some(obstacle => obstacle.checkCollision(player));

        // 衝突した場合はプレーヤーを死亡状態にする
        if (result) {
            this.playerManager.die();
        }

        return result;
    }

    public gameOver(): void {
        this.isGameOver = true;
        this.uiManager.showGameOver();
    }

    private moveToNextScreen(): void {
        // このメソッドは使用しなくなりました
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
        this.isGameOver = false;
        this.currentScreen = 1;
        this.playerManager.reset();
        this.uiManager.updateScreenNumber(this.currentScreen);
        this.backgroundRenderer.setScreen(1);
        
        // 画面1の初期化
        this.initializeScreen(1);
        
        // UIマネージャーのゲームオーバー表示を非表示にする
        this.uiManager.hideGameOver();
    }

    private gameLoop(): void {
        if (this.isGameOver) return;

        if (this.isTransitioning) {
            // ワイプエフェクトの更新
            this.wipeEffect.update();
            this.effectManager.update();
            
            // トランジション完了チェック
            if (!this.wipeEffect.isActive()) {
                this.isTransitioning = false;
                // トランジション完了後にプレーヤーを表示
                this.playerManager.getPlayer().visible = true;
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
        if (!this.playerManager.isDead() && this.checkCollision()) {
            this.gameOver();
        }

        // 障害物の再描画
        this.drawObstacles();
    }

    public getPlayer(): PIXI.Container {
        return this.playerManager.getPlayer();
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
        return this.isGameOver;
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
}

// ゲームの開始
window.onload = () => {
    new Game();
}; 