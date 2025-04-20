import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';
import { PLAYER } from '../utils/constants';

export class Fountain extends Obstacle {
    protected _x: number;  // privateからprotectedに変更し、名前も変更
    protected _y: number;  // privateからprotectedに変更し、名前も変更
    protected _width: number = 40;  // privateからprotectedに変更
    protected _height: number = 20;  // privateからprotectedに変更し、名前も変更
    private waterHeight: number = 100;
    private maxWaterHeight: number = 150;
    private minWaterHeight: number = 15;
    private waterSpeed: number = 4.0;
    private waterDirection: number = 1;
    private platformWidth: number = 60;
    private platformHeight: number = 10;
    private platformY: number;
    private platformSpeed: number = 4.0;
    private platformDirection: number = 1;
    private fountainBounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    } = { left: 0, right: 0, top: 0, bottom: 0 };
    private platformBounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    } = { left: 0, right: 0, top: 0, bottom: 0 };

    // xのアクセサを定義
    public get x(): number {
        return this._x;
    }
    
    public set x(value: number) {
        this._x = value;
    }

    // yのアクセサを定義
    public get y(): number {
        return this._y;
    }
    
    public set y(value: number) {
        this._y = value;
    }

    // widthのアクセサを定義
    public get width(): number {
        return this._width;
    }
    
    public set width(value: number) {
        this._width = value;
    }

    // heightのアクセサを定義
    public get height(): number {
        return this._height;
    }
    
    public set height(value: number) {
        this._height = value;
    }

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game, x: number, y: number, waterSpeed: number = 0.8, platformSpeed: number = 0.8) {
        super(app, obstacles, game);
        this._x = x;
        this._y = y;
        this.waterSpeed = waterSpeed;
        this.platformSpeed = platformSpeed;
        this.platformY = y - this.waterHeight;
        this.initializeBounds();
        this.drawPriority = 5;  // 噴水は中間の優先度
    }

    private initializeBounds(): void {
        this.fountainBounds = {
            left: this._x - this._width / 2,
            right: this._x + this._width / 2,
            top: this._y - this._height,
            bottom: this._y
        };

        this.platformBounds = {
            left: this._x - this.platformWidth / 2,
            right: this._x + this.platformWidth / 2,
            top: this.platformY - this.platformHeight / 2,
            bottom: this.platformY + this.platformHeight / 2
        };
    }

    public draw(): void {
        // 噴水の土台を描画
        this.obstacles.beginFill(0x808080);  // グレー（機械的な色）
        this.obstacles.lineStyle(2, 0x000000);
        this.obstacles.drawRect(
            this.fountainBounds.left,
            this.fountainBounds.top + 80,  // 土台を80ピクセル下げる
            this._width,
            this._height / 2  // 土台の高さを半分に
        );
        this.obstacles.endFill();

        // 水を描画
        this.obstacles.beginFill(0x4169E1, 0.7);
        this.obstacles.lineStyle(1, 0x0000FF, 0.5);
        this.obstacles.drawRect(
            this.fountainBounds.left + 5,
            this._y - this.waterHeight + 60,  // 噴水の下限を60ピクセル下げる
            this._width - 10,
            this.waterHeight
        );
        this.obstacles.endFill();

        // 水の噴出部分を描画
        this.obstacles.beginFill(0x4169E1, 0.9);
        this.obstacles.drawRect(
            this.fountainBounds.left + 5,
            this._y - this.waterHeight - 10 + 60,  // 噴出部分も60ピクセル下げる
            this._width - 10,
            10
        );
        this.obstacles.endFill();

        // 板を描画
        this.obstacles.beginFill(0x8B4513);
        this.obstacles.lineStyle(2, 0x000000);
        this.obstacles.drawRect(
            this.platformBounds.left,
            this.platformBounds.top,
            this.platformWidth,
            this.platformHeight
        );
        this.obstacles.endFill();
    }

    private getPlayerBoundsFromPlayer(player: PIXI.Graphics) {
        return {
            left: player.x - 15,
            right: player.x + 15,
            top: player.y - 35,
            bottom: player.y
        };
    }

    private isOnPlatform(playerBounds: any): boolean {
        // プレーヤーの位置と板の位置が重なっているかをチェック
        // ジャンプ中（velocityY < 0）の場合は板に乗らない
        const isOn = (
            playerBounds.right >= this.platformBounds.left && 
            playerBounds.left <= this.platformBounds.right && 
            Math.abs(playerBounds.bottom - this.platformBounds.top) < 10 &&  // プレーヤーの下端と板の上端の距離が10未満
            this.game.getVelocityY() >= 0  // ジャンプ中でない場合のみ乗れる
        );
        
        return isOn;
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        const playerBounds = this.getPlayerBoundsFromPlayer(player);
        
        // プレーヤーが板の上にいる場合は衝突しない
        if (this.isOnPlatform(playerBounds)) {
            // プレーヤーが既に他の板に乗っている場合は、この板には乗らない
            if (this.game.getPlayerManager().isOnPlatform() && this.game.getPlayerManager().getCurrentPlatform() !== this) {
                return false;
            }
            
            // プレーヤーを板の上に固定（プレーヤーの下端が板の上端に合わせる）
            player.y = this.platformBounds.top - 35;  // プレーヤーの高さを考慮して調整
            this.game.getPlayerManager().setGrounded(true);
            this.game.setVelocityY(0);  // 落下速度を0に設定
            
            // プレーヤーが板に乗っている間、板の上下と連動するようにする
            this.game.getPlayerManager().setOnPlatform(true, this);
            
            // 板に乗った時のログを追加
            console.log('板に乗りました（checkCollision）:', {
                velocityY: this.game.getVelocityY(),
                playerY: player.y,
                platformTop: this.platformBounds.top,
                isOnPlatform: this.game.getPlayerManager().isOnPlatform(),
                currentPlatform: this.game.getPlayerManager().getCurrentPlatform(),
                jumpCooldown: this.game.getPlayerManager().getJumpCooldown()
            });
            
            return false;
        } else {
            // プレーヤーが他の板に乗っているかどうかを確認
            if (!this.game.getPlayerManager().isOnPlatform()) {
                // プレーヤーが板に乗っていない場合は、板との連動を解除
                this.game.getPlayerManager().setOnPlatform(false, null);
            }
        }
        
        // 土台との衝突判定を削除
        
        return false;
    }

    public update(currentTime: number): void {
        // 水の高さを更新
        this.waterHeight += this.waterSpeed * this.waterDirection;
        if (this.waterHeight >= this.maxWaterHeight) {
            this.waterHeight = this.maxWaterHeight;
            this.waterDirection = -1;
        } else if (this.waterHeight <= this.minWaterHeight) {
            this.waterHeight = this.minWaterHeight;
            this.waterDirection = 1;
        }

        // 板の位置を更新
        this.platformY = this._y - this.waterHeight + 60;  // 噴水の先端に合わせる
        this.platformBounds.top = this.platformY - this.platformHeight / 2;
        this.platformBounds.bottom = this.platformY + this.platformHeight / 2;

        // 板の位置を更新（水の高さに合わせて）
        this.platformY += this.platformSpeed * this.platformDirection;
        if (this.platformY <= this._y - this.maxWaterHeight + 60) {  // 噴水の先端に合わせる
            this.platformY = this._y - this.maxWaterHeight + 60;
            this.platformDirection = 1;
        } else if (this.platformY >= this._y - this.minWaterHeight + 60) {  // 噴水の先端に合わせる
            this.platformY = this._y - this.minWaterHeight + 60;
            this.platformDirection = -1;
        }

        // 境界を更新
        this.initializeBounds();
    }

    public reset(): void {
        this.waterHeight = 100;
        this.waterDirection = 1;
        this.platformY = this._y - this.waterHeight;
        this.platformDirection = 1;
        this.initializeBounds();
    }

    public getPlatformBounds(): { left: number; right: number; top: number; bottom: number } {
        return this.platformBounds;
    }
} 