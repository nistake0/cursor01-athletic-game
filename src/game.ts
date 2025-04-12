import * as PIXI from 'pixi.js';
import { Rock } from './Rock';
import { Pool } from './Pool';
import { RollingRock } from './RollingRock';
import { Stump } from './Stump';
import { LargePool } from './LargePool';
import { LotusLeaf } from './LotusLeaf';
import { Chestnut } from './Chestnut';
import { Bee } from './Bee';
import { PLAYER, SCREEN, OBSTACLES, TEXT, BACKGROUND } from './utils/constants';
import { BackgroundRenderer } from './renderers/BackgroundRenderer';
import { PlayerRenderer } from './renderers/PlayerRenderer';
import { UIManager } from './managers/UIManager';

export class Game {
    private app: PIXI.Application;
    private playerRenderer: PlayerRenderer;
    private uiManager: UIManager;
    private background: PIXI.Graphics;
    private obstacles: PIXI.Graphics;
    private keys: { [key: string]: boolean } = {};
    private velocityY: number = 0;
    private _isGrounded: boolean = false;
    private direction: number = 1; // 1: 右向き, -1: 左向き
    private animationTime: number = 0;
    private isMoving: boolean = false;
    private currentScreen: number = 1;
    private isGameOver: boolean = false;
    // 障害物のインスタンスを追加
    private rock: Rock;
    private pool: Pool;
    private rollingRock: RollingRock;
    private stump: Stump;
    private largePool: LargePool;
    private lotusLeaf: LotusLeaf;
    private chestnuts: Chestnut[] = [];
    private lastChestnutSpawnTime: number = 0;
    private bee: Bee;
    private lastBeeSpawnTime: number = 0;
    private backgroundRenderer: BackgroundRenderer;

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

        // 背景を作成
        this.background = new PIXI.Graphics();
        this.app.stage.addChild(this.background);

        // 背景レンダラーを初期化
        this.backgroundRenderer = new BackgroundRenderer(this.app, this);
        this.backgroundRenderer.render();

        // 障害物を作成
        this.obstacles = new PIXI.Graphics();
        this.app.stage.addChild(this.obstacles);

        // プレイヤーレンダラーを初期化
        this.playerRenderer = new PlayerRenderer(this.app, this);
        this.playerRenderer.render();
        const player = this.playerRenderer.getPlayer();
        player.x = PLAYER.INITIAL_X;
        player.y = PLAYER.INITIAL_Y;

        // UIマネージャーの初期化
        this.uiManager = new UIManager(this.app);

        // レイヤー順に追加（プレイヤーは最後に追加して最前面に表示）
        this.app.stage.addChild(player);

        // 障害物のインスタンスを初期化
        this.rock = new Rock(this.app, this.obstacles, player);
        this.pool = new Pool(this.app, this.obstacles, player);
        this.rollingRock = new RollingRock(this.app, this.obstacles, player);

        // 画面5の切り株の初期化
        this.stump = new Stump(this.app, this.obstacles, this);

        // 大きな池の初期化
        this.largePool = new LargePool(this.app, this.obstacles, this);

        // 蓮の葉の初期化
        this.lotusLeaf = new LotusLeaf(this.app, this.obstacles, this);

        // いがぐりの初期化
        this.chestnuts = Array(OBSTACLES.CHESTNUT.MAX_COUNT).fill(null).map(() => new Chestnut(this.app, this.obstacles, this));

        // 蜂の初期化
        this.bee = new Bee(this.app, this.obstacles, this);

        // キーボード入力のハンドリングをセットアップ
        this.setupKeyboardInput();

        // ゲームループを開始
        this.app.ticker.add(() => this.gameLoop());
    }

    private drawObstacles(): void {
        // 画面遷移時にいがぐりをリセット
        if (this.currentScreen !== 8 && this.currentScreen !== 11) {
            this.chestnuts.forEach(chestnut => chestnut.reset());
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
                this.lotusLeaf.draw(this.largePool.getPoolBounds());
                break;
            case 7:
                // 画面7では岩と転がる岩を描画
                this.rock.draw();
                this.rollingRock.draw();
                break;
            case 8:
                // 画面8では背景のみを描画（いがぐりは別途描画）
                break;
            case 9:
                // 画面9では小さい池と転がる岩を描画
                this.pool.draw();
                this.rollingRock.draw();
                break;
            case 10:
                // 画面10では蜂を描画
                this.bee.draw();
                break;
            case 11:
                // 画面11では切り株といがぐりを描画
                this.stump.draw();
                // いがぐりは別途描画（gameLoopで更新）
                break;
            default:
                break;
        }
    }

    private checkCollision(): boolean {
        switch (this.currentScreen) {
            case 2:
                // 画面2の岩との衝突判定
                return this.rock.checkCollision();
            case 3:
                // 画面3の池との衝突判定
                return this.pool.checkCollision();
            case 4:
                // 画面4の切り株との衝突判定
                return this.stump.checkCollision();
            case 5:
                // 画面5の転がる岩との衝突判定
                return this.rollingRock.checkCollision();
            case 6:
                // 画面6の大きな池と蓮の葉との衝突判定
                // 蓮の葉の衝突判定を先に行う
                this.lotusLeaf.checkCollision(this.largePool.getPoolBounds());
                // 蓮の葉に乗っている場合は池の判定をスキップ
                if (this.lotusLeaf.isPlayerOnLotus()) {
                    return false;
                }
                // 蓮の葉に乗っていない場合のみ池の判定を行う
                return this.largePool.checkCollision();
            case 7:
                // 画面7の岩と転がる岩との衝突判定
                return this.rock.checkCollision() || this.rollingRock.checkCollision();
            case 8:
                // 画面8のいがぐりとの衝突判定
                for (const chestnut of this.chestnuts) {
                    if (chestnut.checkCollision(this.playerRenderer.getPlayer().x, this.playerRenderer.getPlayer().y)) {
                        return true;
                    }
                }
                return false;
            case 9:
                // 画面9の小さい池と転がる岩との衝突判定
                return this.pool.checkCollision() || this.rollingRock.checkCollision();
            case 10:
                // 画面10の蜂との衝突判定
                return this.bee.checkCollision(this.playerRenderer.getPlayer().x, this.playerRenderer.getPlayer().y);
            case 11:
                // 画面11の切り株といがぐりとの衝突判定
                if (this.stump.checkCollision()) return true;
                for (const chestnut of this.chestnuts) {
                    if (chestnut.checkCollision(this.playerRenderer.getPlayer().x, this.playerRenderer.getPlayer().y)) {
                        return true;
                    }
                }
                return false;
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
        this.playerRenderer.getPlayer().x = PLAYER.INITIAL_X;
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
                // 画面8に移行したら最後のいがぐり生成時間をリセット
                this.lastChestnutSpawnTime = Date.now();
                break;
            case 9:
                // 画面9に移行したら転がる岩をリセット
                this.rollingRock.reset();
                break;
            case 10:
                // 画面10に移行したら蜂をリセット
                this.bee.reset();
                this.lastBeeSpawnTime = Date.now();
                break;
            case 11:
                // 画面11に移行したら最後のいがぐり生成時間をリセット
                this.lastChestnutSpawnTime = Date.now();
                break;
            default:
                // 画面1-5の場合は特別な処理なし
                break;
        }

        // 画面8と11以外に移行したら必ずいがぐりをリセット
        if (screenNumber !== 8 && screenNumber !== 11) {
            this.chestnuts.forEach(chestnut => chestnut.reset());
        }

        // 画面10以外に移行した場合も蜂をリセット
        if (screenNumber !== 10) {
            this.bee.reset();
            this.lastBeeSpawnTime = 0;
        }
    }

    private reset(): void {
        this.isGameOver = false;
        this.currentScreen = 1;
        this.playerRenderer.getPlayer().x = PLAYER.INITIAL_X;
        this.playerRenderer.getPlayer().y = PLAYER.INITIAL_Y;
        this.velocityY = 0;
        this.uiManager.updateScreenNumber(this.currentScreen);
        this.backgroundRenderer.render();
        
        // 画面1の初期化
        this.initializeScreen(1);
        
        // UIマネージャーのゲームオーバー表示を非表示にする
        this.uiManager.hideGameOver();
    }

    private setupKeyboardInput(): void {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // スペースキーまたは上キーでジャンプ
            if ((e.key === ' ' || e.key === 'ArrowUp') && this._isGrounded) {
                this.velocityY = PLAYER.JUMP_FORCE;
                this._isGrounded = false;
            }

            // ゲームオーバー時にスペースキーでリスタート
            if (e.key === ' ' && this.isGameOver) {
                this.reset();
            }

            // ESCキーで次の画面へ
            if (e.key === 'Escape' && !this.isGameOver) {
                this.moveToNextScreen();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    private gameLoop(): void {
        if (this.isGameOver) return;

        // 移動状態の更新
        this.isMoving = this.keys['ArrowLeft'] || this.keys['ArrowRight'];
        
        // アニメーション時間の更新
        if (this.isMoving) {
            this.animationTime += 1;
        }

        // 左右の移動処理
        if (this.keys['ArrowLeft']) {
            this.playerRenderer.getPlayer().x -= PLAYER.MOVE_SPEED;
            this.direction = -1;
        }
        if (this.keys['ArrowRight']) {
            this.playerRenderer.getPlayer().x += PLAYER.MOVE_SPEED;
            this.direction = 1;
        }

        // 重力とジャンプの処理
        if (!this._isGrounded) {
            this.velocityY += PLAYER.GRAVITY;
            this.playerRenderer.getPlayer().y += this.velocityY;
        }

        // 画面4の切り株の更新と衝突判定
        if (this.currentScreen === 4) {
            this.stump.update();
            this.stump.checkCollision();
        }

        // 画面2の岩の更新
        if (this.currentScreen === 2) {
            this.rock.update();
        }

        // 画面3の池の更新
        if (this.currentScreen === 3) {
            this.pool.update();
        }

        // 画面5の転がる岩の更新
        if (this.currentScreen === 5) {
            this.rollingRock.update();
        }

        // 画面6の蓮の葉の更新
        if (this.currentScreen === 6) {
            this.lotusLeaf.update(this.largePool.getPoolBounds());
        }

        // 画面7の岩と転がる岩の更新
        if (this.currentScreen === 7) {
            this.rock.update();
            this.rollingRock.update();
        }

        // 画面8のいがぐりの更新
        if (this.currentScreen === 8) {
            const currentTime = Date.now();
            
            // 1秒ごとに新しいいがぐりを生成
            if (currentTime - this.lastChestnutSpawnTime >= OBSTACLES.CHESTNUT.SPAWN_INTERVAL) {
                // 非アクティブないがぐりを探して生成
                const inactiveChestnut = this.chestnuts.find(chestnut => !chestnut.isActiveState());
                if (inactiveChestnut) {
                    inactiveChestnut.spawn();
                    this.lastChestnutSpawnTime = currentTime;
                }
            }

            // すべてのいがぐりを更新
            for (const chestnut of this.chestnuts) {
                chestnut.update();
            }
        }

        // 画面9の転がる岩の更新
        if (this.currentScreen === 9) {
            this.rollingRock.update();
        }

        // 画面10の蜂の更新
        if (this.currentScreen === 10) {
            const currentTime = Date.now();
            
            // 2秒ごとに新しい蜂を生成
            if (currentTime - this.lastBeeSpawnTime >= OBSTACLES.BEE.SPAWN_INTERVAL) {
                if (!this.bee.isActiveState()) {
                    this.bee.spawn();
                    this.lastBeeSpawnTime = currentTime;
                }
            }

            // 蜂の更新
            this.bee.update();
        }

        // 画面11の切り株といがぐりの更新
        if (this.currentScreen === 11) {
            const currentTime = Date.now();
            
            // 1秒ごとに新しいいがぐりを生成
            if (currentTime - this.lastChestnutSpawnTime >= OBSTACLES.CHESTNUT.SPAWN_INTERVAL) {
                // 非アクティブないがぐりを探して生成
                const inactiveChestnut = this.chestnuts.find(chestnut => !chestnut.isActiveState());
                if (inactiveChestnut) {
                    inactiveChestnut.spawn();
                    this.lastChestnutSpawnTime = currentTime;
                }
            }

            // すべてのいがぐりを更新
            for (const chestnut of this.chestnuts) {
                chestnut.update();
            }
        }

        // 画面端での処理
        if (this.playerRenderer.getPlayer().x <= 30) {
            this.playerRenderer.getPlayer().x = 30;
        } else if (this.playerRenderer.getPlayer().x >= this.app.screen.width - 30) {
            this.moveToNextScreen();
        }

        // 障害物との衝突判定
        if (this.checkCollision()) {
            this.gameOver();
        }

        // 地面との衝突判定
        if (this.playerRenderer.getPlayer().y >= PLAYER.GROUND_Y) {
            this.playerRenderer.getPlayer().y = PLAYER.GROUND_Y;
            this.velocityY = 0;
            this._isGrounded = true;
        } else if (this.velocityY > 0) { // 落下中の場合のみ_isGroundedをfalseに設定
            this._isGrounded = false;
        }

        // 障害物の再描画（一度だけ）
        this.drawObstacles();

        // スティックマンの再描画（常に最後に行う）
        this.playerRenderer.render();
        // プレイヤーを最前面に表示
        const player = this.playerRenderer.getPlayer();
        if (player.parent) {
            player.parent.removeChild(player);
        }
        this.app.stage.addChild(player);
    }

    public getPlayer(): PIXI.Graphics {
        return this.playerRenderer.getPlayer();
    }

    // プレイヤーの速度を取得
    public getVelocityY(): number {
        return this.velocityY;
    }

    // プレイヤーの速度を設定
    public setVelocityY(value: number): void {
        this.velocityY = value;
    }

    // プレイヤーの接地状態を設定
    public setGrounded(value: boolean): void {
        this._isGrounded = value;
    }

    public setPlayerPosition(x: number, y: number): void {
        const player = this.playerRenderer.getPlayer();
        player.x = x;
        player.y = y;
    }

    public isGrounded(): boolean {
        return this._isGrounded;
    }

    // プレイヤーの向きを取得する関数
    public getPlayerDirection(): number {
        return this.direction;
    }

    // プレイヤーが移動中かどうかを取得する関数
    public isPlayerMoving(): boolean {
        return this.isMoving;
    }

    // プレイヤーのアニメーション時間を取得する関数
    public getPlayerAnimationTime(): number {
        return this.animationTime;
    }
}

// ゲームの開始
window.onload = () => {
    new Game();
}; 