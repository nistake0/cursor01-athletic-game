import * as PIXI from 'pixi.js';
import { Rock } from './Rock';
import { Pool } from './Pool';
import { RollingRock } from './RollingRock';
import { Stump } from './Stump';
import { LargePool } from './LargePool';
import { LotusLeaf } from './LotusLeaf';
import { PLAYER, SCREEN, OBSTACLES, BACKGROUND } from './utils/constants';
import { BackgroundRenderer } from './renderers/BackgroundRenderer';
import { UIManager } from './managers/UIManager';
import { ChestnutManager } from './managers/ChestnutManager';
import { BeeManager } from './managers/BeeManager';
import { EventEmitter, GameEvent } from './utils/EventEmitter';
import { PlayerManager } from './managers/PlayerManager';

export class Game {
    private app: PIXI.Application;
    private background: PIXI.Graphics;
    private obstacles: PIXI.Graphics;
    private currentScreen: number = 1;
    private isGameOver: boolean = false;
    private isNextScreen: boolean = false;
    private isGameStarted: boolean = false;
    private isGamePaused: boolean = false;
    private rock: Rock;
    private pool: Pool;
    private rollingRock: RollingRock;
    private stump: Stump;
    private largePool: LargePool;
    private lotusLeaf: LotusLeaf;
    private backgroundRenderer: BackgroundRenderer;
    private chestnutManager: ChestnutManager;
    private beeManager: BeeManager;
    private eventEmitter: EventEmitter;
    private playerManager: PlayerManager;
    private uiManager: UIManager;

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

        // 障害物のインスタンスを初期化
        this.rock = new Rock(this.app, this.obstacles, this.playerManager.getPlayer());
        this.pool = new Pool(this.app, this.obstacles, this.playerManager.getPlayer());
        this.rollingRock = new RollingRock(this.app, this.obstacles, this.playerManager.getPlayer());

        // 画面5の切り株の初期化
        this.stump = new Stump(this.app, this.obstacles, this);

        // 大きな池の初期化
        this.largePool = new LargePool(this.app, this.obstacles, this);

        // 蓮の葉の初期化
        this.lotusLeaf = new LotusLeaf(this.obstacles, this, this.largePool.getPoolBounds());

        // 蜂マネージャーの初期化
        this.beeManager = new BeeManager(this.app, this.obstacles, this);

        // いがぐりマネージャーの初期化
        this.chestnutManager = new ChestnutManager(this.app, this.obstacles, this);

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
        // 画面遷移時にいがぐりをリセット
        if (this.currentScreen !== 8 && this.currentScreen !== 11) {
            this.chestnutManager.reset();
        }

        this.obstacles.clear();
        
        switch (this.currentScreen) {
            case 1:
                // 画面1では障害物なし
                break;
            case 2:
                // 画面2では岩を描画
                this.rock.draw();
                break;
            case 3:
                // 画面3では小さい池を描画
                this.pool.draw();
                break;
            case 4:
                // 画面4では切り株を描画
                this.stump.draw();
                break;
            case 5:
                // 画面5では転がる岩を描画
                this.rollingRock.draw();
                break;
            case 6:
                // 画面6では大きな池と蓮の葉を描画
                this.largePool.draw();
                this.lotusLeaf.draw();
                break;
            case 7:
                // 画面7では岩と転がる岩を描画
                this.rock.draw();
                this.rollingRock.draw();
                break;
            case 8:
                // 画面8では背景のみを描画（いがぐりは別途描画）
                this.chestnutManager.draw();
                break;
            case 9:
                // 画面9では小さい池と転がる岩を描画
                this.pool.draw();
                this.rollingRock.draw();
                break;
            case 10:
                // 画面10では蜂を描画
                this.beeManager.render();
                break;
            case 11:
                // 画面11では切り株といがぐりを描画
                this.stump.draw();
                this.chestnutManager.draw();
                break;
            default:
                break;
        }
    }

    private checkCollision(): boolean {
        const player = this.playerManager.getPlayer();
        
        switch (this.currentScreen) {
            case 2:
                // 画面2の岩との衝突判定
                return this.rock.checkCollision(player);
            case 3:
                // 画面3の池との衝突判定
                return this.pool.checkCollision(player);
            case 4:
                // 画面4の切り株との衝突判定
                return this.stump.checkCollision(player);
            case 5:
                // 画面5の転がる岩との衝突判定
                return this.rollingRock.checkCollision(player);
            case 6:
                // 画面6の大きな池と蓮の葉との衝突判定
                // 蓮の葉の衝突判定を先に行う
                this.lotusLeaf.checkCollision(player);
                // 蓮の葉に乗っている場合は池の判定をスキップ
                if (this.lotusLeaf.isPlayerOnLotus()) {
                    return false;
                }
                // 蓮の葉に乗っていない場合のみ池の判定を行う
                return this.largePool.checkCollision(player);
            case 7:
                // 画面7の岩と転がる岩との衝突判定
                return this.rock.checkCollision(player) || this.rollingRock.checkCollision(player);
            case 8:
                // 画面8のいがぐりとの衝突判定
                return this.chestnutManager.checkCollision(player);
            case 9:
                // 画面9の小さい池と転がる岩との衝突判定
                return this.pool.checkCollision(player) || this.rollingRock.checkCollision(player);
            case 10:
                // 画面10の蜂との衝突判定
                return this.beeManager.checkCollision(player);
            case 11:
                // 画面11の切り株といがぐりとの衝突判定
                return this.stump.checkCollision(player) || this.chestnutManager.checkCollision(player);
            default:
                return false;
        }
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
        // 障害物をクリアしてから再描画
        this.obstacles.clear();
        this.drawObstacles();
        
        // 転がる岩と切り株をリセット
        this.rollingRock.reset();
        this.stump.reset();
        this.largePool.reset();
        this.lotusLeaf.reset();
        
        // いがぐりのリセット（画面遷移時は常にリセット）
        this.chestnutManager.reset();
        
        // 画面固有の初期化処理
        switch (screenNumber) {
            case 6:
                // 画面6に移行したら切り株を完全にクリア
                this.stump = new Stump(this.app, this.obstacles, this);
                break;
            case 7:
                // 画面7に移行したら転がる岩をリセット
                this.rollingRock.reset();
                break;
            case 8:
                // 画面8に移行
                break;
            case 9:
                // 画面9に移行したら転がる岩をリセット
                this.rollingRock.reset();
                break;
            case 10:
                // 画面10に移行したら蜂をリセット
                this.beeManager.reset();
                break;
            case 11:
                // 画面11に移行
                break;
            default:
                // 画面1-5の場合は特別な処理なし
                break;
        }

        // 画面10以外に移行した場合も蜂をリセット
        if (screenNumber !== 10) {
            this.beeManager.reset();
        }
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

        this.chestnutManager.reset();
    }

    private gameLoop(): void {
        if (this.isGameOver) return;

        // プレイヤーの更新
        this.playerManager.update();

        // 現在の時間を取得
        const currentTime = Date.now();

        // 画面4の切り株の更新と衝突判定
        if (this.currentScreen === 4) {
            this.stump.update(currentTime);
            this.stump.checkCollision(this.playerManager.getPlayer());
        }

        // 画面2の岩の更新
        if (this.currentScreen === 2) {
            this.rock.update(currentTime);
        }

        // 画面3の池の更新
        if (this.currentScreen === 3) {
            this.pool.update(currentTime);
        }

        // 画面5の転がる岩の更新
        if (this.currentScreen === 5) {
            this.rollingRock.update(currentTime);
        }

        // 画面6の蓮の葉の更新
        if (this.currentScreen === 6) {
            this.lotusLeaf.update(currentTime);
        }

        // 画面7の岩と転がる岩の更新
        if (this.currentScreen === 7) {
            this.rock.update(currentTime);
            this.rollingRock.update(currentTime);
        }

        // 画面8のいがぐりの更新
        if (this.currentScreen === 8) {
            this.chestnutManager.update(currentTime);
        }

        // 画面9の転がる岩の更新
        if (this.currentScreen === 9) {
            this.rollingRock.update(currentTime);
        }

        // 画面10の蜂の更新
        if (this.currentScreen === 10) {
            this.beeManager.update(currentTime);
        }

        // 画面11の切り株といがぐりの更新
        if (this.currentScreen === 11) {
            this.chestnutManager.update(currentTime);
        }

        // 障害物との衝突判定
        if (this.checkCollision()) {
            this.gameOver();
        }

        // 障害物の再描画（一度だけ）
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
}

// ゲームの開始
window.onload = () => {
    new Game();
}; 