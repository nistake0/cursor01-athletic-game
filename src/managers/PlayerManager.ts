import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { PLAYER } from '../utils/constants';
import { PlayerRenderer } from '../renderers/PlayerRenderer';
import { EventEmitter, GameEvent } from '../utils/EventEmitter';
import { InputManager, ActionType } from './InputManager';

export class PlayerManager {
    private app: PIXI.Application;
    private game: Game;
    private playerRenderer: PlayerRenderer;
    private velocityY: number = 0;
    private isGrounded: boolean = false;
    private direction: number = 1; // 1: 右向き, -1: 左向き
    private animationTime: number = 0;
    private isMoving: boolean = false;
    private eventEmitter: EventEmitter;
    private inputManager: InputManager;

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
    }

    public getPlayer(): PIXI.Graphics {
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
} 