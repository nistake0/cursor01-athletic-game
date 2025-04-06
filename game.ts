import * as PIXI from 'pixi.js';
import { Rock } from './Rock';
import { Pool } from './Pool';
import { RollingRock } from './RollingRock';
import { Stump } from './Stump';
import { LargePool } from './LargePool';
import { LotusLeaf } from './LotusLeaf';
import { Chestnut } from './Chestnut';
import { Bee } from './Bee';

export class Game {
    private app: PIXI.Application;
    private player: PIXI.Graphics;
    private background: PIXI.Graphics;
    private obstacles: PIXI.Graphics;
    private screenText: PIXI.Text;
    private gameOverText: PIXI.Text;
    private speed: number = 4.5;
    private keys: { [key: string]: boolean } = {};
    private velocityY: number = 0;
    private gravity: number = 0.5;
    private jumpForce: number = -12;
    private isGrounded: boolean = false;
    private direction: number = 1; // 1: 右向き, -1: 左向き
    private animationTime: number = 0;
    private isMoving: boolean = false;
    private currentScreen: number = 1;
    private isGameOver: boolean = false;
    private lotusX: number = 0;
    private lotusDirection: number = 1; // 1: 右向き, -1: 左向き
    private lotusSpeed: number = 2;
    private isOnLotus: boolean = false;
    private poolBounds: any;
    // 障害物のインスタンスを追加
    private rock: Rock;
    private pool: Pool;
    private rollingRock: RollingRock;
    private stump: Stump;
    private largePool: LargePool;
    private lotusLeaf: LotusLeaf;
    private chestnuts: Chestnut[] = [];
    private lastChestnutSpawnTime: number = 0;
    private readonly CHESTNUT_SPAWN_INTERVAL: number = 1000; // 1秒
    private readonly MAX_CHESTNUTS: number = 3; // 最大3つまで
    private readonly GRAVITY: number = 0.5;
    private readonly JUMP_FORCE: number = -12;
    private readonly MOVE_SPEED: number = 3.5; // 4.05から3.5に変更
    private readonly SCREEN_WIDTH: number = 800;
    private bee: Bee;
    private lastBeeSpawnTime: number = 0;
    private readonly BEE_SPAWN_INTERVAL: number = 2000; // 2秒ごとに蜂を生成

    constructor() {
        // PIXIアプリケーションを初期化
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x87CEEB, // 空色
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        // キャンバスをDOMに追加
        document.body.appendChild(this.app.view as HTMLCanvasElement);

        // 背景を作成
        this.background = new PIXI.Graphics();
        this.drawBackground();
        this.app.stage.addChild(this.background);

        // 障害物を作成
        this.obstacles = new PIXI.Graphics();
        this.app.stage.addChild(this.obstacles);

        // スティックマンを作成
        this.player = new PIXI.Graphics();
        this.drawStickMan();
        this.player.x = 50; // 左端付近に配置
        this.player.y = this.app.screen.height - 120;

        // 画面番号テキストを作成
        this.screenText = new PIXI.Text(`Screen: ${this.currentScreen}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 4,
            align: 'center'
        });
        this.screenText.x = 20;
        this.screenText.y = 20;

        // ゲームオーバーテキストを作成（初期状態は非表示）
        this.gameOverText = new PIXI.Text('GAME OVER\nPress SPACE to restart', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xFF0000,
            stroke: 0x000000,
            strokeThickness: 6,
            align: 'center'
        });
        this.gameOverText.anchor.set(0.5);
        this.gameOverText.x = this.app.screen.width / 2;
        this.gameOverText.y = this.app.screen.height / 2;
        this.gameOverText.visible = false;

        // レイヤー順に追加（プレイヤーは最後に追加して最前面に表示）
        this.app.stage.addChild(this.screenText);
        this.app.stage.addChild(this.gameOverText);
        this.app.stage.addChild(this.player);

        // 障害物のインスタンスを初期化
        this.rock = new Rock(this.app, this.obstacles, this.player);
        this.pool = new Pool(this.app, this.obstacles, this.player);
        this.rollingRock = new RollingRock(this.app, this.obstacles, this.player);

        // 画面5の切り株の初期化
        this.stump = new Stump(this.app, this.obstacles, this);

        // 大きな池の初期化
        this.largePool = new LargePool(this.app, this.obstacles, this);

        // 蓮の葉の初期化
        this.lotusLeaf = new LotusLeaf(this.app, this.obstacles, this);

        // いがぐりの初期化
        this.chestnuts = Array(3).fill(null).map(() => new Chestnut(this.app, this.obstacles, this));

        // 蜂の初期化
        this.bee = new Bee(this.app, this.obstacles, this);

        // キーボード入力のハンドリングをセットアップ
        this.setupKeyboardInput();

        // ゲームループを開始
        this.app.ticker.add(() => this.gameLoop());
    }

    private drawBackground(): void {
        this.background.clear();

        // 空のグラデーション
        const height = this.app.screen.height;
        const steps = 20;
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const startColor = 0x87CEEB; // 空色
            const endColor = 0x4682B4;   // より濃い青
            const color = this.lerpColor(startColor, endColor, ratio);
            
            this.background.beginFill(color);
            this.background.drawRect(
                0,
                (height * i) / steps,
                this.app.screen.width,
                height / steps + 1
            );
            this.background.endFill();
        }

        // 奥の木々のシルエット
        this.drawForestSilhouette();

        // 地面（グレー）
        this.background.beginFill(0xCCCCCC);
        this.background.drawRect(0, this.app.screen.height - 100, this.app.screen.width, 50);
        this.background.endFill();

        // 草
        this.background.beginFill(0x33CC33);
        this.background.drawRect(0, this.app.screen.height - 110, this.app.screen.width, 10);
        for (let x = 0; x < this.app.screen.width; x += 15) {
            this.background.beginFill(0x33CC33);
            const height = 5 + Math.random() * 15;
            this.background.drawRect(x, this.app.screen.height - 110 - height, 8, height);
            this.background.endFill();
        }

        // 手前の木を描画
        this.drawTree(100);
        this.drawTree(this.app.screen.width - 100);
    }

    private drawForestSilhouette(): void {
        this.background.beginFill(0x000000, 0.8);
        
        // 不規則な森のシルエットを作成
        let x = 0;
        while (x < this.app.screen.width) {
            const treeHeight = 150 + Math.random() * 100;
            const treeWidth = 40 + Math.random() * 30;
            
            // 木の形を描く
            this.background.moveTo(x, this.app.screen.height - 110);
            this.background.lineTo(x + treeWidth/2, this.app.screen.height - 110 - treeHeight);
            this.background.lineTo(x + treeWidth, this.app.screen.height - 110);
            this.background.lineTo(x, this.app.screen.height - 110);
            
            x += treeWidth * 0.7; // 木々を少し重ねる
        }
        
        this.background.endFill();
    }

    private drawTree(x: number): void {
        // 幹
        this.background.beginFill(0x8B4513);
        this.background.drawRect(x - 20, this.app.screen.height - 250, 40, 140);
        this.background.endFill();

        // 枝
        this.background.lineStyle(20, 0x8B4513);
        this.background.moveTo(x, this.app.screen.height - 200);
        this.background.lineTo(x - 50, this.app.screen.height - 250);
        this.background.moveTo(x, this.app.screen.height - 180);
        this.background.lineTo(x + 50, this.app.screen.height - 230);
        this.background.lineStyle(0);

        // 葉っぱの色を設定
        const leafColors = [0x228B22, 0x32CD32, 0x006400]; // 異なる緑色

        // メインの葉っぱの塊
        for (let i = 0; i < 3; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            this.background.beginFill(leafColors[i % leafColors.length]);
            this.background.drawCircle(x + offsetX, this.app.screen.height - 280 + offsetY, 50);
            this.background.endFill();
        }

        // 枝の先の葉っぱ
        this.background.beginFill(leafColors[0]);
        this.background.drawCircle(x - 50, this.app.screen.height - 260, 30);
        this.background.endFill();

        this.background.beginFill(leafColors[1]);
        this.background.drawCircle(x + 50, this.app.screen.height - 240, 30);
        this.background.endFill();

        // 葉っぱの細部（ハイライト）
        this.background.beginFill(0x90EE90);
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40;
            const size = 5 + Math.random() * 10;
            this.background.drawCircle(
                x + Math.cos(angle) * distance,
                this.app.screen.height - 280 + Math.sin(angle) * distance,
                size
            );
        }
        this.background.endFill();
    }

    private lerpColor(start: number, end: number, ratio: number): number {
        const r1 = (start >> 16) & 0xFF;
        const g1 = (start >> 8) & 0xFF;
        const b1 = start & 0xFF;

        const r2 = (end >> 16) & 0xFF;
        const g2 = (end >> 8) & 0xFF;
        const b2 = end & 0xFF;

        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);

        return (r << 16) | (g << 8) | b;
    }

    private drawStickMan(): void {
        this.player.clear();
        
        // より太い線と明るい色で描画
        const bodyColor = 0xFF4444; // 明るい赤色
        this.player.lineStyle(4, bodyColor); // 線を4ピクセルに
        
        // 頭（輪郭と塗りつぶし）
        this.player.beginFill(bodyColor);
        this.player.drawCircle(0, -20, 12);
        this.player.endFill();
        
        // 体
        this.player.moveTo(0, -8);
        this.player.lineTo(0, 12);
        
        if (!this.isGrounded) {
            // ジャンプ中の姿勢
            // 腕を上げる
            this.player.moveTo(0, 0);
            this.player.lineTo(-20 * this.direction, -10);
            this.player.moveTo(0, 0);
            this.player.lineTo(20 * this.direction, -10);
            
            // 脚を曲げる
            this.player.moveTo(0, 12);
            this.player.lineTo(-15 * this.direction, 25);
            this.player.moveTo(0, 12);
            this.player.lineTo(15 * this.direction, 25);
        } else {
            // 通常の走る姿勢
            // 腕のアニメーション
            const armSwing = Math.sin(this.animationTime * 0.2) * (this.isMoving ? 0.5 : 0);
            this.player.moveTo(0, 0);
            this.player.lineTo(-15 * this.direction - armSwing * 10, 8);
            this.player.moveTo(0, 0);
            this.player.lineTo(15 * this.direction + armSwing * 10, 8);
            
            // 脚のアニメーション
            const legSwing = Math.sin(this.animationTime * 0.2) * (this.isMoving ? 0.5 : 0);
            this.player.moveTo(0, 12);
            this.player.lineTo(-10 * this.direction - legSwing * 15, 35);
            this.player.moveTo(0, 12);
            this.player.lineTo(10 * this.direction + legSwing * 15, 35);
        }

        // 目（キャラクターに表情を付ける）
        const eyeColor = 0xFFFFFF; // 白色
        this.player.lineStyle(0);
        this.player.beginFill(eyeColor);
        this.player.drawCircle(6 * this.direction, -22, 4); // 目の位置を少し調整
        this.player.endFill();
        
        // 瞳
        this.player.beginFill(0x000000);
        this.player.drawCircle(7 * this.direction, -22, 2);
        this.player.endFill();
    }

    private drawObstacles(): void {
        // 画面遷移時にいがぐりをリセット
        if (this.currentScreen !== 8) {
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
                // 画面5では切り株を描画
                this.stump.draw();
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
                // 画面5の切り株との衝突判定
                return this.stump.checkCollision();
            case 6:
                // 画面6の大きな池との衝突判定
                return this.largePool.checkCollision();
            case 7:
                // 画面7の岩と転がる岩との衝突判定
                return this.rock.checkCollision() || this.rollingRock.checkCollision();
            case 8:
                // 画面8のいがぐりとの衝突判定
                for (const chestnut of this.chestnuts) {
                    if (chestnut.checkCollision(this.player.x, this.player.y)) {
                        return true;
                    }
                }
                return false;
            case 9:
                // 画面9の小さい池と転がる岩との衝突判定
                return this.pool.checkCollision() || this.rollingRock.checkCollision();
            case 10:
                // 画面10の蜂との衝突判定
                return this.bee.checkCollision(this.player.x, this.player.y);
            default:
                return false;
        }
    }

    private gameOver(): void {
        this.isGameOver = true;
        this.gameOverText.visible = true;
    }

    private restart(): void {
        this.isGameOver = false;
        this.gameOverText.visible = false;
        this.currentScreen = 1;
        this.player.x = 50;
        this.player.y = this.app.screen.height - 120;
        this.velocityY = 0;
        this.lotusX = 0; // 蓮の葉の位置をリセット
        this.isOnLotus = false;
        this.screenText.text = `Screen: ${this.currentScreen}`;
        this.drawBackground();
        
        // 障害物をクリアしてから再描画
        this.obstacles.clear();
        this.drawObstacles();
        
        // 転がる岩のリセット
        this.rollingRock.reset();
        this.stump.reset();
        this.largePool.reset();
        this.lotusLeaf.reset();

        // いがぐりをリセット
        this.chestnuts.forEach(chestnut => chestnut.reset());
        this.lastChestnutSpawnTime = 0;

        // 蜂をリセット
        this.bee.reset();
        this.lastBeeSpawnTime = 0;
    }

    private setupKeyboardInput(): void {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // スペースキーでジャンプ
            if (e.key === ' ' && this.isGrounded) {
                this.velocityY = -12;
                this.isGrounded = false;
            }

            // ESCキーで次の画面へ
            if (e.key === 'Escape' && !this.isGameOver) {
                this.currentScreen++;
                this.player.x = 50;
                this.screenText.text = `Screen: ${this.currentScreen}`;
                this.drawBackground();
                
                // 障害物をクリアしてから再描画
                this.obstacles.clear();
                this.drawObstacles();
                
                // 画面遷移時に転がる岩と切り株をリセット
                this.rollingRock.reset();
                this.stump.reset();
                this.largePool.reset();
                this.lotusLeaf.reset();
                
                // 画面6に移行したら切り株を完全にクリア
                if (this.currentScreen === 6) {
                    this.stump = new Stump(this.app, this.obstacles, this);
                }
                
                // 画面7に移行したら転がる岩をリセット
                if (this.currentScreen === 7) {
                    this.rollingRock.reset();
                }

                // 画面8に移行したら最後のいがぐり生成時間をリセット
                if (this.currentScreen === 8) {
                    this.lastChestnutSpawnTime = Date.now();
                }

                // 画面遷移時に必ずいがぐりをリセット
                this.chestnuts.forEach(chestnut => chestnut.reset());

                // 画面9に移行したら転がる岩をリセット
                if (this.currentScreen === 9) {
                    this.rollingRock.reset();
                }

                // 画面10に移行したら蜂をリセット
                if (this.currentScreen === 10) {
                    this.bee.reset();
                    this.lastBeeSpawnTime = Date.now();
                }

                // 画面10以外に移行した場合も蜂をリセット
                if (this.currentScreen !== 10) {
                    this.bee.reset();
                    this.lastBeeSpawnTime = 0;
                }
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
            this.player.x -= this.speed;
            this.direction = -1;
        }
        if (this.keys['ArrowRight']) {
            this.player.x += this.speed;
            this.direction = 1;
        }

        // 重力とジャンプの処理
        this.velocityY += this.gravity;
        this.player.y += this.velocityY;

        // 画面2の岩の更新
        if (this.currentScreen === 2) {
            this.rock.update();
        }

        // 画面3の池の更新
        if (this.currentScreen === 3) {
            this.pool.update();
        }

        // 画面4の転がる石の更新
        if (this.currentScreen === 4) {
            this.rollingRock.update();
            // 障害物の再描画（画面4の場合のみ毎フレーム更新）
            this.drawObstacles();
        }

        // 画面5の切り株の更新
        if (this.currentScreen === 5) {
            this.stump.update();
            // 障害物の再描画（画面5の場合も毎フレーム更新）
            this.drawObstacles();
        }

        // 画面6の蓮の葉の更新
        if (this.currentScreen === 6) {
            // 蓮の葉の更新
            this.lotusLeaf.update(this.largePool.getPoolBounds());
            // 蓮の葉の位置が更新されたら障害物を再描画
            this.drawObstacles();
        }

        // 画面7の岩と転がる岩の更新
        if (this.currentScreen === 7) {
            this.rock.update();
            this.rollingRock.update();
            // 障害物の再描画（画面7の場合も毎フレーム更新）
            this.drawObstacles();
        }

        // 画面8のいがぐりの更新
        if (this.currentScreen === 8) {
            const currentTime = Date.now();
            
            // 1秒ごとに新しいいがぐりを生成
            if (currentTime - this.lastChestnutSpawnTime >= this.CHESTNUT_SPAWN_INTERVAL) {
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
            // 障害物の再描画（画面9の場合も毎フレーム更新）
            this.drawObstacles();
        }

        // 画面10の蜂の更新
        if (this.currentScreen === 10) {
            const currentTime = Date.now();
            
            // 2秒ごとに新しい蜂を生成
            if (currentTime - this.lastBeeSpawnTime >= this.BEE_SPAWN_INTERVAL) {
                if (!this.bee.isActiveState()) {
                    this.bee.spawn();
                    this.lastBeeSpawnTime = currentTime;
                }
            }

            // 蜂の更新
            this.bee.update();
            // 障害物の再描画
            this.drawObstacles();
        }

        // 画面端での処理
        if (this.player.x <= 30) {
            this.player.x = 30;
        } else if (this.player.x >= this.app.screen.width - 30) {
            this.currentScreen++;
            this.player.x = 50;
            this.screenText.text = `Screen: ${this.currentScreen}`;
            this.drawBackground();
            
            // 障害物をクリアしてから再描画
            this.obstacles.clear();
            this.drawObstacles();
            
            // 画面遷移時に転がる岩と切り株をリセット
            this.rollingRock.reset();
            this.stump.reset();
            this.largePool.reset();
            this.lotusLeaf.reset();
            
            // 画面6に移行したら切り株を完全にクリア
            if (this.currentScreen === 6) {
                this.stump = new Stump(this.app, this.obstacles, this);
            }
            
            // 画面7に移行したら転がる岩をリセット
            if (this.currentScreen === 7) {
                this.rollingRock.reset();
            }

            // 画面8に移行したら最後のいがぐり生成時間をリセット
            if (this.currentScreen === 8) {
                this.lastChestnutSpawnTime = Date.now();
            }

            // 画面遷移時に必ずいがぐりをリセット
            this.chestnuts.forEach(chestnut => chestnut.reset());

            // 画面9に移行したら転がる岩をリセット
            if (this.currentScreen === 9) {
                this.rollingRock.reset();
            }

            // 画面10に移行したら蜂をリセット
            if (this.currentScreen === 10) {
                this.bee.reset();
                this.lastBeeSpawnTime = Date.now();
            }

            // 画面10以外に移行した場合も蜂をリセット
            if (this.currentScreen !== 10) {
                this.bee.reset();
                this.lastBeeSpawnTime = 0;
            }
        }

        // 障害物との衝突判定
        if (this.checkCollision()) {
            this.gameOver();
        }

        // 地面との衝突判定
        const groundY = this.app.screen.height - 120;
        if (this.player.y >= groundY) {
            this.player.y = groundY;
            this.velocityY = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        // スティックマンの再描画（常に最後に行う）
        this.drawStickMan();
        // プレイヤーを最前面に表示
        if (this.player.parent) {
            this.player.parent.removeChild(this.player);
        }
        this.app.stage.addChild(this.player);
    }

    public getPlayer(): { x: number; y: number } {
        return this.player;
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
        this.isGrounded = value;
    }
}

// ゲームの開始
window.onload = () => {
    new Game();
}; 