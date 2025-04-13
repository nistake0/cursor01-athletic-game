import * as PIXI from 'pixi.js';
import { Rock } from "./obstacles/Rock";
import { Pool } from "./obstacles/Pool";
import { RollingRock } from "./obstacles/RollingRock";
import { Stump } from "./obstacles/Stump";
import { LargePool } from "./obstacles/LargePool";
import { LotusLeaf } from "./obstacles/LotusLeaf";
import { Bee } from "./obstacles/Bee";
import { Chestnut } from "./obstacles/Chestnut";
import { PLAYER, SCREEN, OBSTACLES, BACKGROUND } from './utils/constants';
import { BackgroundRenderer } from './renderers/BackgroundRenderer';
import { UIManager } from './managers/UIManager';
import { ChestnutSpawner } from './obstacles/ChestnutSpawner';
import { BeeSpawner } from './obstacles/BeeSpawner';
import { EventEmitter, GameEvent } from './utils/EventEmitter';
import { PlayerManager } from './managers/PlayerManager';
import { ObstacleFactory } from './obstacles/ObstacleFactory';
import { Obstacle } from './obstacles/Obstacle';

export class Game {
    private app: PIXI.Application;
    private background: PIXI.Graphics;
    private obstacles: PIXI.Graphics;
    private player!: PIXI.Graphics;
    private currentScreen: number = 1;
    private isGameOver: boolean = false;
    private backgroundRenderer: BackgroundRenderer;
    private eventEmitter: EventEmitter;
    private playerManager: PlayerManager;
    private uiManager: UIManager;
    
    // 新しい障害物管理用の変数
    public obstacleList: Obstacle[] = [];
    private obstacleFactory: ObstacleFactory;
    
    // 画面ごとの障害物設定
    private screenObstacles: { [key: number]: string[] } = {
        1: ['Signboard'], // 画面1は看板のみ
        2: ['Rock'],
        3: ['Pool'],
        4: ['Stump'],
        5: ['RollingRock'],
        6: ['LotusLeaf', 'LargePool'],
        7: ['Rock', 'RollingRock'],
        8: ['ChestnutSpawner'],
        9: ['Pool', 'RollingRock'],
        10: ['BeeSpawner'],
        11: ['Stump', 'ChestnutSpawner']
    };

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
        
        // 初期画面の障害物を設定
        this.initializeScreen(1);

        // イベントリスナーの設定
        this.setupEventListeners();

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
            if (!this.isGameOver) {
                this.moveToNextScreen();
            }
        });
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
        
        // すべての障害物との衝突をチェック
        return this.obstacleList.some(obstacle => obstacle.checkCollision(player));
    }

    private gameOver(): void {
        this.isGameOver = true;
        this.uiManager.showGameOver();
    }

    private moveToNextScreen(): void {
        this.currentScreen++;
        this.playerManager.getPlayer().x = PLAYER.INITIAL_X;
        this.uiManager.updateScreenNumber(this.currentScreen);
        this.backgroundRenderer.render();
        
        // 新しい画面の初期化
        this.initializeScreen(this.currentScreen);
    }

    private initializeScreen(screenNumber: number): void {
        // 既存の障害物をクリア
        this.obstacleList.forEach(obstacle => obstacle.reset());
        this.obstacleList = [];
        
        // 新しい画面の障害物を生成
        const obstacleTypes = this.screenObstacles[screenNumber] || [];
        obstacleTypes.forEach(type => {
            const obstacle = this.obstacleFactory.createObstacle(type);
            this.obstacleList.push(obstacle);
        });
        
        // 背景を再描画
        this.backgroundRenderer.render();
    }

    private reset(): void {
        this.isGameOver = false;
        this.currentScreen = 1;
        this.playerManager.reset();
        this.uiManager.updateScreenNumber(this.currentScreen);
        this.backgroundRenderer.render();
        
        // 画面1の初期化
        this.initializeScreen(1);
        
        // UIマネージャーのゲームオーバー表示を非表示にする
        this.uiManager.hideGameOver();
    }

    private gameLoop(): void {
        if (this.isGameOver) return;

        // プレイヤーの更新
        this.playerManager.update();

        // 現在の時間を取得
        const currentTime = Date.now();

        // すべての障害物を更新
        this.obstacleList.forEach(obstacle => obstacle.update(currentTime));

        // 障害物との衝突判定
        if (this.checkCollision()) {
            this.gameOver();
        }

        // 障害物の再描画
        this.drawObstacles();
    }

    public getPlayer(): PIXI.Graphics {
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
}

// ゲームの開始
window.onload = () => {
    new Game();
}; 