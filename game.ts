import * as PIXI from 'pixi.js';
import { Rock } from './Rock';
import { Pool } from './Pool';
import { RollingRock } from './RollingRock';
import { Stump } from './Stump';

export class Game {
    private app: PIXI.Application;
    private player: PIXI.Graphics;
    private background: PIXI.Graphics;
    private obstacles: PIXI.Graphics;
    private screenText: PIXI.Text;
    private gameOverText: PIXI.Text;
    private speed: number = 5;
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

        // レイヤー順に追加
        this.app.stage.addChild(this.player);
        this.app.stage.addChild(this.screenText);
        this.app.stage.addChild(this.gameOverText);

        // 障害物のインスタンスを初期化
        this.rock = new Rock(this.app, this.obstacles, this.player);
        this.pool = new Pool(this.app, this.obstacles, this.player);
        this.rollingRock = new RollingRock(this.app, this.obstacles, this.player);

        // 画面5の切り株の初期化
        this.stump = new Stump(this.app, this.obstacles, this);

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
        this.obstacles.clear();
        
        if (this.currentScreen === 2) {
            // 岩の描画
            this.rock.draw();
            // 描画後にobstaclesを再描画
            this.app.stage.removeChild(this.obstacles);
            this.app.stage.addChild(this.obstacles);
        } else if (this.currentScreen === 3) {
            // 画面3の障害物（池）
            this.pool.draw();
            // 描画後にobstaclesを再描画
            this.app.stage.removeChild(this.obstacles);
            this.app.stage.addChild(this.obstacles);
        } else if (this.currentScreen === 4) {
            // 画面4の転がる石
            this.rollingRock.draw();
            // 描画後にobstaclesを再描画
            this.app.stage.removeChild(this.obstacles);
            this.app.stage.addChild(this.obstacles);
        } else if (this.currentScreen === 5) {
            // 画面5の切り株
            this.stump.draw();
        } else if (this.currentScreen === 6) {
            // 画面6の大きな池と蓮の葉
            const screenWidth = this.app.screen.width;
            const poolWidth = screenWidth * 2/3;
            const poolStartX = (screenWidth - poolWidth) / 2;
            const poolEndX = poolStartX + poolWidth;
            const poolY = this.app.screen.height - 80; // 池の位置を下げる
            const poolDepth = 40; // 池の深さを調整

            // 池を楕円形で描画
            this.obstacles.beginFill(0x4169E1);
            this.obstacles.lineStyle(2, 0x000000);
            this.obstacles.drawEllipse(
                poolStartX + poolWidth/2, // 中心X
                poolY - poolDepth/2,      // 中心Y
                poolWidth/2,              // 幅の半径
                poolDepth/2               // 高さの半径
            );
            
            // 池の水面の反射効果（楕円に合わせて調整）
            this.obstacles.lineStyle(1, 0xFFFFFF, 0.3);
            const reflectionCount = 10;
            for (let i = 0; i < reflectionCount; i++) {
                const angle = (i / reflectionCount) * Math.PI;
                const x = poolStartX + poolWidth/2 + Math.cos(angle) * (poolWidth/2 - 10);
                const y = poolY - poolDepth/2 + Math.sin(angle) * (poolDepth/2 - 5);
                this.obstacles.moveTo(x, y);
                this.obstacles.lineTo(x + 5, y);
            }

            // 蓮の葉を描画
            const lotusWidth = poolWidth / 5;
            const lotusHeight = 10;
            
            // 蓮の葉の初期位置を設定（初回のみ）
            if (this.lotusX === 0) {
                this.lotusX = poolStartX + 50; // 左端から少し離して開始
            }

            // 蓮の葉本体（濃い緑）
            this.obstacles.beginFill(0x228B22);
            this.obstacles.lineStyle(2, 0x006400);
            this.obstacles.drawEllipse(
                this.lotusX + lotusWidth/2,
                poolY - poolDepth/2 + 5, // 水面の上に配置
                lotusWidth/2,
                lotusHeight
            );

            // 蓮の葉の模様（薄い緑の線）
            this.obstacles.lineStyle(1, 0x90EE90);
            for (let i = 0; i < 3; i++) {
                this.obstacles.drawEllipse(
                    this.lotusX + lotusWidth/2,
                    poolY - poolDepth/2 + 5,
                    lotusWidth/2 - 10 - i*8,
                    lotusHeight - 2 - i*2
                );
            }

            // 池の範囲を保存（衝突判定用）
            this.poolBounds = {
                left: poolStartX,
                right: poolEndX,
                top: poolY - poolDepth/2, // 池の上限を水面の位置に変更
                bottom: poolY,
                width: poolWidth,
                centerX: poolStartX + poolWidth/2,
                centerY: poolY - poolDepth/2,
                radiusX: poolWidth/2,
                radiusY: poolDepth/2
            };
        }
    }

    private checkCollision(): boolean {
        if (this.currentScreen === 2) {
            // 岩との衝突判定
            return this.rock.checkCollision();
        } else if (this.currentScreen === 3) {
            // 池との衝突判定
            return this.pool.checkCollision();
        } else if (this.currentScreen === 4) {
            // 転がる石との衝突判定
            return this.rollingRock.checkCollision();
        } else if (this.currentScreen === 5) {
            // 切り株との衝突判定
            return this.stump.checkCollision();
        } else if (this.currentScreen === 6) {
            const playerBottom = this.player.y;
            const playerTop = this.player.y - 35;
            const playerLeft = this.player.x - 15;
            const playerRight = this.player.x + 15;
            const playerVelocityY = this.velocityY;

            // 蓮の葉との衝突判定
            const lotusWidth = this.poolBounds.width / 5;
            const lotusLeft = this.lotusX;
            const lotusRight = this.lotusX + lotusWidth;
            const lotusY = this.poolBounds.top + 5; // 水面の位置を池の上限に合わせる

            // デバッグ情報の表示
            console.log("===デバッグ情報===");
            console.log("池のbound:", {
                left: this.poolBounds.left,
                right: this.poolBounds.right,
                top: this.poolBounds.top,
                bottom: this.poolBounds.bottom
            });
            console.log("プレーヤーの位置:", {
                right: playerRight,
                left: playerLeft,
                bottom: playerBottom
            });
            console.log("蓮の葉のbound:", {
                left: lotusLeft,
                right: lotusRight,
                y: lotusY
            });
            console.log("isOnLotus:", this.isOnLotus);
            console.log("================");

            // 蓮の葉に乗っているかどうかを先に判定
            if ((playerBottom >= lotusY - 35 && // 判定範囲をさらに広げる
                playerBottom <= lotusY + 35 && // 判定範囲をさらに広げる
                playerVelocityY >= -8 && // 上昇中でもより許容
                playerRight >= lotusLeft - 15 && // 判定範囲をさらに広げる
                playerLeft <= lotusRight + 15)) {
                
                // 蓮の葉に乗った時の処理
                this.player.y = lotusY;
                this.velocityY = 0;
                this.isGrounded = true;
                this.isOnLotus = true;
                
                // デバッグ用：蓮の葉に乗ったことを表示
                console.log("gameLoop: 蓮の葉に乗りました！");
                
                return false; // 蓮の葉に乗っている場合は必ずfalseを返す
            }

            // 蓮の葉から外れた場合はフラグをリセット
            if (!(playerBottom === lotusY &&
                playerRight >= lotusLeft &&
                playerLeft <= lotusRight)) {
                this.isOnLotus = false;
            }

            // 池との衝突判定を後に行う
            // プレーヤーが池の範囲内にいて、蓮の葉に乗っていない場合
            if (playerRight >= this.poolBounds.left && 
                playerLeft <= this.poolBounds.right && 
                playerBottom >= this.poolBounds.top - 20 && // 池の上限より少し上から判定
                !this.isOnLotus) { // 蓮の葉に乗っていない場合のみ
                
                // デバッグ用：衝突判定の範囲を可視化
                console.log("池に落ちました！");
                return true; // ゲームオーバー
            }
        }

        return false;
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
    }

    private setupKeyboardInput(): void {
        const keys: { [key: string]: boolean } = {};

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            keys[e.key] = true;
            
            // ジャンプ処理
            if ((e.key === 'ArrowUp' || e.key === ' ') && this.isGrounded && !this.isGameOver) {
                this.velocityY = this.jumpForce;
                this.isGrounded = false;
            }

            // リスタート処理
            if (e.key === ' ' && this.isGameOver) {
                this.restart();
            }

            // デバッグ用：エスケープキーで次の画面に移動
            if (e.key === 'Escape' && !this.isGameOver) {
                this.currentScreen++;
                this.player.x = 50;
                this.screenText.text = `Screen: ${this.currentScreen}`;
                this.drawBackground();
                this.drawObstacles();
                
                // 画面遷移時に転がる岩をリセット
                this.rollingRock.reset();
            }
        });

        window.addEventListener('keyup', (e: KeyboardEvent) => {
            keys[e.key] = false;
        });

        this.keys = keys;
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

        // スティックマンの再描画
        this.drawStickMan();

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
        }

        // 画面6の蓮の葉の更新
        if (this.currentScreen === 6) {
            // 蓮の葉の移動
            this.lotusX += this.lotusSpeed * this.lotusDirection;
            
            // 池の端での反転（余裕を持たせる）
            const lotusWidth = this.poolBounds.width / 5;
            const margin = 30; // 端での余裕
            if (this.lotusX <= this.poolBounds.left + margin) {
                this.lotusX = this.poolBounds.left + margin;
                this.lotusDirection = 1;
            } else if (this.lotusX + lotusWidth >= this.poolBounds.right - margin) {
                this.lotusX = this.poolBounds.right - margin - lotusWidth;
                this.lotusDirection = -1;
            }

            // 蓮の葉との衝突判定をここでも行う
            const lotusLeft = this.lotusX;
            const lotusRight = this.lotusX + lotusWidth;
            const lotusY = this.poolBounds.top + 5; // 水面の位置を池の上限に合わせる
            
            // 蓮の葉に乗っているかどうかを判定
            if ((this.player.y >= lotusY - 35 && // 判定範囲をさらに広げる
                this.player.y <= lotusY + 35 && // 判定範囲をさらに広げる
                this.velocityY >= -8 && // 上昇中でもより許容
                this.player.x + 15 >= lotusLeft - 15 && // 判定範囲をさらに広げる
                this.player.x - 15 <= lotusRight + 15)) { // 判定範囲をさらに広げる
                
                // 蓮の葉に乗った時の処理
                this.player.y = lotusY;
                this.velocityY = 0;
                this.isGrounded = true;
                this.isOnLotus = true;
                
                // デバッグ用：蓮の葉に乗ったことを表示
                console.log("gameLoop: 蓮の葉に乗りました！");
            } else {
                // 蓮の葉から外れた場合はフラグをリセット
                this.isOnLotus = false;
            }

            // プレイヤーが蓮の葉に乗っている場合の処理
            if (this.isOnLotus) {
                // 蓮の葉と一緒に移動（常に移動するように変更）
                this.player.x += this.lotusSpeed * this.lotusDirection;
                
                // 蓮の葉の範囲内に留める
                if (this.player.x - 15 < lotusLeft) {
                    this.player.x = lotusLeft + 15;
                } else if (this.player.x + 15 > lotusRight) {
                    this.player.x = lotusRight - 15;
                }
            }

            // 蓮の葉の位置が更新されたら障害物を再描画
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
            this.isOnLotus = false; // 地面に着地したら蓮の葉フラグをリセット
        }
    }
}

// ゲームの開始
window.onload = () => {
    new Game();
}; 