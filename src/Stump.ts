import * as PIXI from 'pixi.js';
import { Game } from './game';
import { Obstacle } from './Obstacle';

export class Stump extends Obstacle {
    private stumps: PIXI.Graphics[] = [];
    private stumpData: { x: number; height: number }[] = [];
    private wasOnStump: boolean = false;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.initializeStumpData();
    }

    private initializeStumpData(): void {
        const screenWidth = this.app.screen.width;
        const totalWidth = screenWidth * 2/3;
        const startX = (screenWidth - totalWidth) / 2 + 50;
        const spacing = totalWidth / 4;

        this.stumpData = [
            { x: startX + spacing * 4, height: 80 },  // 一番右の切り株
            { x: startX + spacing * 3, height: 120 }, // 2番目
            { x: startX + spacing * 2, height: 60 },  // 真ん中
            { x: startX + spacing, height: 100 },     // 4番目
            { x: startX, height: 40 }                 // 一番左の切り株
        ];
    }

    public draw(): void {
        // 既存の切り株をクリア
        this.stumps.forEach(stump => {
            this.obstacles.removeChild(stump);
        });
        this.stumps = [];

        // 切り株を描画
        this.stumpData.forEach((data, index) => {
            const stump = new PIXI.Graphics();
            
            // 切り株の本体（茶色）
            stump.beginFill(0x8B4513);
            stump.lineStyle(2, 0x3D1F00);
            
            const stumpWidth = 40;
            const baseY = this.app.screen.height - 80;
            
            // 切り株の本体を描画
            stump.drawRect(
                data.x - stumpWidth/2,
                baseY - data.height,
                stumpWidth,
                data.height
            );
            stump.endFill();
            
            // 年輪を描画
            stump.lineStyle(1, 0x3D1F00);
            for (let i = 1; i <= 3; i++) {
                const ringRadius = (stumpWidth/2) - (i * 5);
                stump.beginFill(0x8B4513);
                stump.drawEllipse(
                    data.x,
                    baseY - data.height,
                    ringRadius,
                    ringRadius/2
                );
                stump.endFill();
            }

            // 木の皮のテクスチャ（縦線）
            stump.lineStyle(1, 0x3D1F00);
            for (let i = 0; i < stumpWidth; i += 4) {
                stump.moveTo(data.x - stumpWidth/2 + i, baseY - data.height);
                stump.lineTo(data.x - stumpWidth/2 + i, baseY);
            }

            this.obstacles.addChild(stump);
            this.stumps.push(stump);
        });
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        const playerBounds = this.getPlayerBoundsFromPlayer(player);
        let isOnAnyStump = false;

        // すべての切り株に対して判定
        for (const stump of this.stumpData) {
            const stumpBounds = this.getStumpBoundsForStump(stump);

            // プレイヤーが切り株に乗っているかチェック（より寛容な判定）
            const isOnStump = playerBounds.bottom >= stumpBounds.top - 5 && 
                             playerBounds.bottom <= stumpBounds.top + 15 && 
                             playerBounds.left >= stumpBounds.left - 20 && 
                             playerBounds.right <= stumpBounds.right + 20;

            // 切り株に乗っている場合
            if (isOnStump) {
                // プレイヤーの位置を切り株の上に固定（playerBottomがstumpTopと同じになるように）
                this.game.setPlayerPosition(player.x, stumpBounds.top - 35);
                this.game.setVelocityY(0);
                this.game.setGrounded(true);
                isOnAnyStump = true;
                break;
            }

            // 切り株との衝突判定（壁としての振る舞い）
            const collision = playerBounds.right > stumpBounds.left &&
                             playerBounds.left < stumpBounds.right &&
                             playerBounds.bottom > stumpBounds.top &&
                             playerBounds.top < stumpBounds.bottom;

            if (collision) {
                // 左側からの衝突
                if (playerBounds.left <= stumpBounds.right &&
                    playerBounds.left >= stumpBounds.right - 10 &&
                    playerBounds.right > stumpBounds.right) {
                    this.game.setPlayerPosition(stumpBounds.right + 15, player.y);
                }
                // 右側からの衝突
                if (playerBounds.right >= stumpBounds.left &&
                    playerBounds.right <= stumpBounds.left + 10 &&
                    playerBounds.left < stumpBounds.left) {
                    this.game.setPlayerPosition(stumpBounds.left - 15, player.y);
                }
                // 下からの衝突
                if (playerBounds.top <= stumpBounds.bottom &&
                    playerBounds.top >= stumpBounds.top - 5 &&
                    playerBounds.right >= stumpBounds.left &&
                    playerBounds.left <= stumpBounds.right) {
                    this.game.setPlayerPosition(player.x, stumpBounds.bottom + 35);
                }
                break;
            }
        }

        // 切り株に乗っていない場合は、地面にいる状態を解除
        if (!isOnAnyStump && this.wasOnStump) {
            this.game.setGrounded(false);
            console.log('切り株から落下: 状態変化', {
                wasOnStump: this.wasOnStump,
                isOnAnyStump: isOnAnyStump,
                isGrounded: this.game.isGrounded()
            });
        }

        // 切り株に乗っている状態が変わった場合にログを出力
        if (this.wasOnStump !== isOnAnyStump) {
            if (isOnAnyStump) {
                console.log('切り株に乗りました: 状態変化', {
                    wasOnStump: this.wasOnStump,
                    isOnAnyStump: isOnAnyStump,
                    isGrounded: this.game.isGrounded()
                });
            }
        }

        // 切り株に乗っている状態を更新
        this.wasOnStump = isOnAnyStump;

        return false;
    }

    public update(currentTime: number): void {
        // 切り株は動かないので、現時点では何もしない
    }

    public reset(): void {
        // 切り株をクリア
        this.stumps.forEach(stump => {
            this.obstacles.removeChild(stump);
        });
        this.stumps = [];
        
        // 内部状態を初期化
        this.wasOnStump = false;
        this.initializeStumpData();
    }

    public getStumpData(): { x: number; height: number }[] {
        return this.stumpData;
    }

    private getStumpBoundsForStump(stump: { x: number; height: number }): { left: number; right: number; bottom: number; top: number } {
        const stumpLeft = stump.x - 40/2;
        const stumpRight = stump.x + 40/2;
        const stumpTop = this.app.screen.height - 80 - stump.height;
        const stumpBottom = this.app.screen.height - 80;
        return { left: stumpLeft, right: stumpRight, bottom: stumpBottom, top: stumpTop };
    }

    private getPlayerBoundsFromPlayer(player: PIXI.Graphics): { left: number; right: number; bottom: number; top: number } {
        const playerLeft = player.x - 15;
        const playerRight = player.x + 15;
        const playerTop = player.y - 35;
        const playerBottom = player.y + 35;
        return { left: playerLeft, right: playerRight, bottom: playerBottom, top: playerTop };
    }
} 