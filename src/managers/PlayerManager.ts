import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { PLAYER, SCREEN } from '../utils/constants';
import { PlayerRenderer } from '../renderers/PlayerRenderer';
import { EventEmitter, GameEvent } from '../utils/EventEmitter';
import { InputManager, ActionType } from './InputManager';
import { LotusLeaf } from '../obstacles/LotusLeaf';
import { TarzanRope } from '../obstacles/TarzanRope';

export class PlayerManager {
    private app: PIXI.Application;
    private game: Game;
    private playerRenderer: PlayerRenderer;
    private velocityY: number = 0;
    private isJumping: boolean = false;
    private isGrounded: boolean = false;
    private direction: number = 1; // 1: 右向き, -1: 左向き
    private animationTime: number = 0;
    private isMoving: boolean = false;
    private _isOnLotus: boolean = false;
    private _isOnRope: boolean = false;
    private _currentRope: TarzanRope | null = null;
    private _isOnPlatform: boolean = false;  // 板に乗っているかどうかを示すフラグ
    private _currentPlatform: any = null;  // 現在乗っている板
    private eventEmitter: EventEmitter;
    private inputManager: InputManager;
    private isRising: boolean = false; // 上昇中かどうかを示すフラグ
    private lastMoveDirection: number = 0; // 最後に移動していた方向（-1: 左, 1: 右, 0: 移動なし）
    private moveMomentum: number = 0; // 移動の勢い
    private static readonly MOMENTUM_DECAY = 0.95; // 移動の勢いの減衰率
    private jumpCooldown: number = 0; // ジャンプ後のクールダウン

    // 死亡演出関連のプロパティ
    private isDead: boolean = false;
    private deathTimer: number = 0;
    private readonly DEATH_DURATION: number = 2000; // 死亡表示時間（ミリ秒）

    private isGameCleared: boolean = false;  // ゲームクリア状態を管理するフラグ

    constructor(app: PIXI.Application, game: Game, eventEmitter: EventEmitter) {
        this.app = app;
        this.game = game;
        this.eventEmitter = eventEmitter;
        this.inputManager = new InputManager(eventEmitter, game);
        
        // プレイヤーレンダラーを初期化
        this.playerRenderer = new PlayerRenderer(this.app, this);
        this.playerRenderer.render();
        const player = this.playerRenderer.getPlayer();
        player.x = PLAYER.INITIAL_X;
        player.y = PLAYER.INITIAL_Y;
        
        // レイヤー順に追加（プレイヤーは最後に追加して最前面に表示）
        this.app.stage.addChild(player);
        
        // イベントリスナーの設定
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.eventEmitter.on(GameEvent.JUMP, () => {
            console.log('PlayerManager: ジャンプイベントを受信', {
                isGrounded: this.isGrounded,
                isOnPlatform: this._isOnPlatform,
                isOnRope: this._isOnRope,
                velocityY: this.velocityY
            });
            
            if (this.isGrounded || this._isOnPlatform) {
                this.velocityY = PLAYER.JUMP_FORCE;
                this.isGrounded = false;
                console.log('PlayerManager: ジャンプを実行', { velocityY: this.velocityY });
            } else if (this._isOnRope && this._currentRope) {
                // ロープにつかまっている状態でジャンプした場合、ロープから離れる
                this._currentRope.releasePlayer();
                this._isOnRope = false;
                this._currentRope = null;
                this.velocityY = PLAYER.JUMP_FORCE * 0.8; // ロープからジャンプする場合は少し弱めのジャンプ
                console.log('PlayerManager: ロープからジャンプを実行', { velocityY: this.velocityY });
            }
        });
    }

    public update(): void {
        // プレイヤーが破棄されている場合は更新をスキップ
        if (!this.playerRenderer.getPlayer()) {
            return;
        }

        if (this.isDead) {
            // 死亡状態の更新
            const currentTime = Date.now();
            if (currentTime - this.deathTimer >= this.DEATH_DURATION) {
                // 死亡表示時間が経過したら、残機を減らすかゲームオーバーにする
                this.game.handlePlayerDeath();
                this.isDead = false;
                this.getPlayerOrThrow().alpha = 1.0;  // 透明度を元に戻す
            }
            // 死亡状態でも描画を更新する
            this.playerRenderer.render();
            return;
        }

        // InputManagerの状態を更新
        this.inputManager.update();

        // ロープにつかまっている場合は移動処理をスキップ
        if (this._isOnRope) {
            // ロープにつかまっている状態では、ジャンプ以外の操作は受け付けない
            // ロープの揺れに合わせてプレイヤーの位置が更新される
            this.playerRenderer.render();
            return;
        }

        // ジャンプ処理（板に乗っている状態でもジャンプできるようにする）
        if (this.inputManager.isActionActive(ActionType.JUMP) && (this.isGrounded || this._isOnPlatform)) {
            this.velocityY = PLAYER.JUMP_FORCE;
            this.isGrounded = false;
            // 板に乗っている状態でジャンプした場合は、板から離れる
            if (this._isOnPlatform) {
                this._isOnPlatform = false;
                this._currentPlatform = null;
                // ジャンプ後は一定時間板に乗れないようにする
                this.jumpCooldown = 10; // 10フレームのクールダウン
            }
        }

        // ジャンプクールダウンの更新
        if (this.jumpCooldown > 0) {
            this.jumpCooldown--;
        }

        // 板に乗っている場合は、板の位置に合わせてプレーヤーの位置を更新
        if (this._isOnPlatform && this._currentPlatform && this.jumpCooldown <= 0) {
            // 板の位置を取得
            const platformBounds = this._currentPlatform.getPlatformBounds();
            if (platformBounds) {
                // プレーヤーの位置を板の上に設定
                this.getPlayerOrThrow().y = platformBounds.top - 35;  // プレーヤーの高さを考慮して調整
            }
            this.playerRenderer.render();
            return;
        }

        // 移動状態の更新
        this.isMoving = this.inputManager.isActionActive(ActionType.MOVE_LEFT) || 
                        this.inputManager.isActionActive(ActionType.MOVE_RIGHT);
        
        // アニメーション時間の更新
        if (this.isMoving) {
            this.animationTime += 1;
        }

        // 重力とジャンプの処理
        if (!this.isGrounded) {
            this.velocityY += PLAYER.GRAVITY;
            this.getPlayerOrThrow().y += this.velocityY;
            
            // 上昇中かどうかを判断
            const wasRising = this.isRising;
            this.isRising = this.velocityY < 0;
            
            // 上昇から落下に変わった瞬間に、移動の勢いをリセット
            // ただし、移動中は勢いを維持する
            if (wasRising && !this.isRising && !this.isMoving) {
                this.moveMomentum = 0;
            }
        } else {
            // 地面に接地している場合は上昇中ではない
            this.isRising = false;
            // 地面に接地したら移動の勢いをリセット
            this.moveMomentum = 0;
        }

        // 左右の移動処理
        if (this.isRising || this.isGrounded) {
            // 上昇中または地面に接地している場合は通常の移動処理
            if (this.inputManager.isActionActive(ActionType.MOVE_LEFT)) {
                this.getPlayerOrThrow().x -= PLAYER.MOVE_SPEED;
                this.direction = -1;
                this.lastMoveDirection = -1;
                this.moveMomentum = PLAYER.MOVE_SPEED;
            }
            if (this.inputManager.isActionActive(ActionType.MOVE_RIGHT)) {
                this.getPlayerOrThrow().x += PLAYER.MOVE_SPEED;
                this.direction = 1;
                this.lastMoveDirection = 1;
                this.moveMomentum = PLAYER.MOVE_SPEED;
            }
        } else if (this.moveMomentum > 0.1) {
            // 落下中で移動の勢いがある場合は、最後に移動していた方向に動き続ける
            this.getPlayerOrThrow().x += this.lastMoveDirection * this.moveMomentum;
            // 移動の勢いを徐々に減衰させる
            this.moveMomentum *= PlayerManager.MOMENTUM_DECAY;
        }

        // 画面端での処理
        const player = this.getPlayerOrThrow();
        if (player.x <= 30) {
            player.x = 30;
        } else if (player.x >= this.app.screen.width - 30) {
            // ゲームクリア状態の場合は画面右端で止まる
            if (this.isGameCleared) {
                player.x = this.app.screen.width - 30;
            } else {
                this.eventEmitter.emit(GameEvent.NEXT_SCREEN);
            }
        }

        // 地面との衝突判定
        if (player.y >= PLAYER.GROUND_Y) {
            player.y = PLAYER.GROUND_Y;
            this.velocityY = 0;
            this.isGrounded = true;
            
            // 地面に着地したら自動ジャンプを実行（ゲームクリア時）
            if (this.game.getGameClearState() && this.inputManager.isActionActive(ActionType.JUMP)) {
                this.velocityY = PLAYER.JUMP_FORCE;
                this.isGrounded = false;
                console.log('PlayerManager: 地面に着地して自動ジャンプを実行', { velocityY: this.velocityY });
            }
        } else if (this.velocityY > 0) { // 落下中の場合のみisGroundedをfalseに設定
            this.isGrounded = false;
        }

        // スティックマンの再描画（常に最後に行う）
        this.playerRenderer.render();
        // プレイヤーを最前面に表示
        if (player.parent) {
            player.parent.removeChild(player);
        }
        this.app.stage.addChild(player);
    }

    public reset(): void {
        // プレイヤーを完全に破棄して再作成
        if (this.playerRenderer) {
            this.playerRenderer.destroy();
        }
        
        // 新しいプレイヤーレンダラーを作成
        this.playerRenderer = new PlayerRenderer(this.app, this);
        this.playerRenderer.render();
        
        // プレイヤーオブジェクトを取得
        const player = this.playerRenderer.getPlayer();
        if (!player) {
            console.error('Failed to create new player');
            return;
        }

        // InputManagerを再初期化
        this.inputManager = new InputManager(this.eventEmitter, this.game);
        
        // プレイヤーの位置と状態をリセット
        player.x = PLAYER.INITIAL_X;
        player.y = PLAYER.INITIAL_Y;
        player.rotation = 0;
        player.alpha = 1;
        player.pivot.set(0, 0);

        // その他の状態をリセット
        this.velocityY = 0;
        this.isGrounded = false;
        this.direction = 1;
        this.animationTime = 0;
        this.isMoving = false;
        this._isOnRope = false;
        this._currentRope = null;
        this.isRising = false;
        this.lastMoveDirection = 0;
        this.moveMomentum = 0;
        this.isGameCleared = false;
        this.isDead = false;
        
        // プレーヤーの描画を更新
        this.playerRenderer.render();
    }

    public getPlayer(): PIXI.Container | null {
        return this.playerRenderer?.getPlayer() ?? null;
    }

    public getPlayerOrThrow(): PIXI.Container {
        const player = this.playerRenderer?.getPlayer();
        if (!player) {
            throw new Error('Player is not initialized');
        }
        return player;
    }

    public getVelocityY(): number {
        return this.velocityY;
    }

    public setVelocityY(value: number): void {
        this.velocityY = value;
    }

    public setGrounded(value: boolean): void {
        this.isGrounded = value;
    }

    public isGroundedState(): boolean {
        return this.isGrounded;
    }

    public getDirection(): number {
        return this.direction;
    }

    public isMovingState(): boolean {
        return this.isMoving;
    }

    public getAnimationTime(): number {
        return this.animationTime;
    }

    public setPlayerPosition(x: number, y: number): void {
        const player = this.getPlayerOrThrow();
        player.x = x;
        player.y = y;
    }

    public getGame(): Game {
        return this.game;
    }

    public setOnLotus(value: boolean): void {
        this._isOnLotus = value;
    }

    public isOnLotus(): boolean {
        return this._isOnLotus;
    }

    public setOnRope(value: boolean, rope: TarzanRope | null = null): void {
        this._isOnRope = value;
        this._currentRope = rope;
    }

    public isOnRope(): boolean {
        return this._isOnRope;
    }

    public getCurrentRope(): TarzanRope | null {
        return this._currentRope;
    }

    public isOnLotusLeaf(): boolean {
        const lotusLeaf = this.game.obstacleList.find(obstacle => obstacle instanceof LotusLeaf) as LotusLeaf;
        if (!lotusLeaf) return false;

        const lotusBounds = lotusLeaf.getLotusBounds();
        if (!lotusBounds) return false;

        const player = this.getPlayer();
        const playerBounds = player.getBounds();

        // プレイヤーが蓮の葉の上にいるかチェック
        const isAboveLotus = playerBounds.bottom >= lotusBounds.top - 35 && 
                            playerBounds.bottom <= lotusBounds.top + 35;
        const isWithinLotusX = playerBounds.right > lotusBounds.left && 
                              playerBounds.left < lotusBounds.right;

        return isAboveLotus && isWithinLotusX;
    }

    public die(): void {
        if (!this.isDead) {
            this.isDead = true;
            this.deathTimer = Date.now();
            this.getPlayerOrThrow().alpha = 0.5;  // 半透明にして死亡状態を表現
            this.velocityY = 0;  // 落下速度をリセット
            this.isGrounded = true;  // 地面に接地している状態にする
        }
    }

    public isDeadState(): boolean {
        return this.isDead;
    }

    public setOnPlatform(value: boolean, platform: any = null): void {
        this._isOnPlatform = value;
        this._currentPlatform = platform;
    }

    public isOnPlatform(): boolean {
        return this._isOnPlatform;
    }

    public getCurrentPlatform(): any {
        return this._currentPlatform;
    }

    public getJumpCooldown(): number {
        return this.jumpCooldown;
    }

    public getInputManager(): InputManager {
        return this.inputManager;
    }

    public onGameClear(): void {
        // 既にゲームクリア処理が実行されている場合は何もしない
        if (this.isGameCleared) {
            return;
        }

        console.log('PlayerManager: ゲームクリア処理を開始');
        
        // ゲームクリア時の入力制御
        this.inputManager.setInputEnabled(false);
        this.inputManager.setAutoJumping(true);
        
        // 初期ジャンプを実行
        this.velocityY = PLAYER.JUMP_FORCE;
        this.isGrounded = false;
        this._isOnPlatform = false;
        this._currentPlatform = null;
        
        // 地面との衝突判定を有効にする
        const player = this.getPlayerOrThrow();
        if (player.y >= PLAYER.GROUND_Y) {
            player.y = PLAYER.GROUND_Y;
            this.velocityY = 0;
            this.isGrounded = true;
        }
        
        // ゲームクリア状態を設定
        this.isGameCleared = true;
        
        console.log('PlayerManager: ゲームクリア処理完了', {
            isInputEnabled: false,
            isAutoJumping: true,
            velocityY: this.velocityY,
            isGrounded: this.isGrounded,
            playerY: player.y
        });
    }

    public destroy(): void {
        // プレイヤーキャラクターを削除
        const player = this.playerRenderer.getPlayer();
        if (player && player.parent) {
            player.parent.removeChild(player);
        }
        // イベントリスナーを解除
        this.inputManager.destroy();
        // プレイヤーレンダラーを破棄
        this.playerRenderer.destroy();
    }
} 