import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { PLAYER, SCREEN } from '../utils/constants';
import { PlayerRenderer } from '../renderers/PlayerRenderer';
import { EventEmitter, GameEvent } from '../utils/EventEmitter';
import { InputManager, ActionType } from './InputManager';
import { LotusLeaf } from '../obstacles/LotusLeaf';

export class PlayerManager {
    private app: PIXI.Application;
    private game: Game;
    private playerRenderer: PlayerRenderer;
    private player: PIXI.Container = new PIXI.Container();
    private velocityY: number = 0;
    private isJumping: boolean = false;
    private isGrounded: boolean = false;
    private isNextScreen: boolean = false;
    private isGameStarted: boolean = false;
    private isGamePaused: boolean = false;
    private direction: number = 1; // 1: 右向き, -1: 左向き
    private animationTime: number = 0;
    private isMoving: boolean = false;
    private _isOnLotus: boolean = false;
    private eventEmitter: EventEmitter;
    private inputManager: InputManager;

    // 死亡演出関連のプロパティ
    private isDying: boolean = false;
    private deathStartTime: number = 0;
    private lastBlinkTime: number = 0;
    private isBlinking: boolean = false;
    private static readonly DEATH_ANIMATION_DURATION = 2000; // 死亡演出の時間（ミリ秒）
    private static readonly BLINK_INTERVAL = 200; // まばたきの間隔（ミリ秒）
    private static readonly BLINK_DURATION = 100; // まばたきの時間（ミリ秒）

    constructor(app: PIXI.Application, game: Game, eventEmitter: EventEmitter) {
        this.app = app;
        this.game = game;
        this.eventEmitter = eventEmitter;
        this.inputManager = new InputManager(eventEmitter);
        
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
            if (this.isGrounded && !this.game.getGameOverState()) {
                this.velocityY = PLAYER.JUMP_FORCE;
                this.isGrounded = false;
            }
        });
    }

    public update(): void {
        console.log("player ", this.isDying);
        // 死亡中は通常の更新をスキップ
        if (this.isDying) {
            this.updateDeathAnimation();
            return;
        }

        // InputManagerの状態を更新
        this.inputManager.update();

        // 移動状態の更新
        this.isMoving = this.inputManager.isActionActive(ActionType.MOVE_LEFT) || 
                        this.inputManager.isActionActive(ActionType.MOVE_RIGHT);
        
        // アニメーション時間の更新
        if (this.isMoving) {
            this.animationTime += 1;
        }

        // 左右の移動処理
        if (this.inputManager.isActionActive(ActionType.MOVE_LEFT)) {
            this.playerRenderer.getPlayer().x -= PLAYER.MOVE_SPEED;
            this.direction = -1;
        }
        if (this.inputManager.isActionActive(ActionType.MOVE_RIGHT)) {
            this.playerRenderer.getPlayer().x += PLAYER.MOVE_SPEED;
            this.direction = 1;
        }

        // 重力とジャンプの処理
        if (!this.isGrounded) {
            this.velocityY += PLAYER.GRAVITY;
            this.playerRenderer.getPlayer().y += this.velocityY;
        }

        // 画面端での処理
        if (this.playerRenderer.getPlayer().x <= 30) {
            this.playerRenderer.getPlayer().x = 30;
        } else if (this.playerRenderer.getPlayer().x >= this.app.screen.width - 30) {
            this.eventEmitter.emit(GameEvent.NEXT_SCREEN);
        }

        // 地面との衝突判定
        if (this.playerRenderer.getPlayer().y >= PLAYER.GROUND_Y) {
            this.playerRenderer.getPlayer().y = PLAYER.GROUND_Y;
            this.velocityY = 0;
            this.isGrounded = true;
        } else if (this.velocityY > 0) { // 落下中の場合のみisGroundedをfalseに設定
            this.isGrounded = false;
        }

        // スティックマンの再描画（常に最後に行う）
        this.playerRenderer.render();
        // プレイヤーを最前面に表示
        const player = this.playerRenderer.getPlayer();
        if (player.parent) {
            player.parent.removeChild(player);
        }
        this.app.stage.addChild(player);
    }

    public reset(): void {
        this.playerRenderer.getPlayer().x = PLAYER.INITIAL_X;
        this.playerRenderer.getPlayer().y = PLAYER.INITIAL_Y;
        this.velocityY = 0;
        this.isGrounded = false;
        this.direction = 1;
        this.animationTime = 0;
        this.isMoving = false;

        // 死亡状態のリセット
        this.isDying = false;
        const player = this.playerRenderer.getPlayer();
        player.rotation = 0;
        player.alpha = 1;
        player.pivot.set(0, 0);
    }

    public getPlayer(): PIXI.Container {
        return this.playerRenderer.getPlayer();
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
        const player = this.playerRenderer.getPlayer();
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
        if (this.isDying) return;
        
        this.isDying = true;
        this.deathStartTime = Date.now();
        this.lastBlinkTime = this.deathStartTime;
        this.isBlinking = false;
        
        // 死亡時のアニメーション設定
        const player = this.playerRenderer.getPlayer();
        player.rotation = Math.PI / 2; // 90度回転して倒れる
        player.pivot.set(0, player.height / 2);
        player.position.set(
            player.position.x,
            player.position.y + player.height / 2
        );

        // プレイヤーを再描画
        this.playerRenderer.render();
    }

    private updateDeathAnimation(): void {
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.deathStartTime;
        // 死亡演出が終了したらゲームオーバー
        if (elapsedTime >= PlayerManager.DEATH_ANIMATION_DURATION) {
            this.game.gameOver();
            return;
        }

        // まばたきアニメーション
        if (currentTime - this.lastBlinkTime >= PlayerManager.BLINK_INTERVAL) {
            this.isBlinking = true;
            this.lastBlinkTime = currentTime;
        }

        if (this.isBlinking) {
            if (currentTime - this.lastBlinkTime >= PlayerManager.BLINK_DURATION) {
                this.isBlinking = false;
            }
            const player = this.playerRenderer.getPlayer();
            player.alpha = this.isBlinking ? 0.3 : 1;
        }

        // プレイヤーを再描画（毎フレーム呼び出す）
        this.playerRenderer.render();
    }

    public isDead(): boolean {
        return this.isDying;
    }
} 