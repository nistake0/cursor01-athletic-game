import * as PIXI from 'pixi.js';
import { Obstacle } from './Obstacle';
import { PlayerManager } from '../managers/PlayerManager';
import { Game } from '../game';
import { SCREEN } from '../utils/constants';

export class Spring extends Obstacle {
    private spring: PIXI.Graphics;
    private isCompressed: boolean = false;
    private compressionTime: number = 0;
    private readonly COMPRESSION_DURATION: number = 10;
    private readonly SPRING_FORCE: number = -15; // 跳ね返り力を強くする（-12から-15に）
    private playerManager: PlayerManager;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game, playerManager: PlayerManager) {
        super(app, obstacles, game);
        this.playerManager = playerManager;
        this.spring = new PIXI.Graphics();
        
        // 画面中央に配置（少し下げる）
        this.spring.x = SCREEN.WIDTH / 2;
        this.spring.y = SCREEN.HEIGHT - 85; // 15ピクセル下げる
        
        this.app.stage.addChild(this.spring);
    }

    public draw(): void {
        this.spring.clear();
        
        // ばねの色を設定（金属的な色）
        const springColor = 0x708090; // スレートグレー
        const springTopColor = 0xC0C0C0; // シルバー
        const springHighlightColor = 0xE0E0E0; // 明るいシルバー
        
        // ばねの本体（切り株のような形状）
        this.spring.lineStyle(2, springColor);
        this.spring.beginFill(springColor);
        
        // ばねの上部（圧縮状態に応じて高さが変わる）
        const height = this.isCompressed ? 30 : 50; // 高さを2倍に
        this.spring.drawRect(-20, -height, 40, height);
        
        // ばねの上部の装飾
        this.spring.lineStyle(2, springTopColor);
        this.spring.beginFill(springTopColor);
        this.spring.drawRect(-15, -height, 30, 5);
        
        // ばねのコイル模様（より多く描画）
        this.spring.lineStyle(2, springHighlightColor);
        for (let i = 0; i < 6; i++) { // コイルの数を増やす
            const y = -height + (i * 8);
            this.spring.moveTo(-15, y);
            this.spring.lineTo(15, y);
        }
        
        // 金属的な光沢を追加
        this.spring.lineStyle(1, springHighlightColor);
        this.spring.moveTo(-18, -height + 5);
        this.spring.lineTo(-18, -5);
        
        this.spring.endFill();
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        const playerBounds = player.getBounds();
        const springBounds = this.spring.getBounds();

        // プレイヤーがばねの上にいるかチェック
        const isAboveSpring = playerBounds.bottom >= springBounds.top - 5 && 
                            playerBounds.bottom <= springBounds.top + 5;
        const isWithinSpringX = playerBounds.right > springBounds.left && 
                               playerBounds.left < springBounds.right;

        // プレイヤーがばねと横方向で重なっているかチェック（通り抜け防止）
        const isOverlappingX = playerBounds.right > springBounds.left && 
                              playerBounds.left < springBounds.right;
        const isOverlappingY = playerBounds.top < springBounds.bottom && 
                              playerBounds.bottom > springBounds.top;

        // 上からの衝突（乗る）か横からの衝突（通り抜け防止）かを判定
        if (isAboveSpring && isWithinSpringX) {
            return true; // 上からの衝突（乗る）
        } else if (isOverlappingX && isOverlappingY) {
            // 横からの衝突（通り抜け防止）
            // プレイヤーの位置を調整
            if (playerBounds.right > springBounds.left && playerBounds.left < springBounds.left) {
                player.x = springBounds.left - playerBounds.width;
            } else if (playerBounds.left < springBounds.right && playerBounds.right > springBounds.right) {
                player.x = springBounds.right;
            }
            return true;
        }

        return false;
    }

    public update(currentTime: number): void {
        // 圧縮状態の更新
        if (this.isCompressed) {
            this.compressionTime++;
            if (this.compressionTime >= this.COMPRESSION_DURATION) {
                this.isCompressed = false;
                this.compressionTime = 0;
            }
        }

        // プレイヤーとの衝突判定
        const player = this.playerManager.getPlayer();
        if (this.checkCollision(player) && !this.isCompressed) {
            // プレイヤーがばねの上にいる場合のみ跳ね返る
            const playerBounds = player.getBounds();
            const springBounds = this.spring.getBounds();
            const isAboveSpring = playerBounds.bottom >= springBounds.top - 5 && 
                                playerBounds.bottom <= springBounds.top + 5;
            
            if (isAboveSpring) {
                // プレイヤーをばねの上に固定
                player.y = springBounds.top - player.getBounds().height;
                this.playerManager.setGrounded(true);
                
                // ばねを圧縮状態にする
                this.isCompressed = true;
                this.compressionTime = 0;
                
                // プレイヤーに上向きの力を加える
                this.playerManager.setVelocityY(this.SPRING_FORCE);
                this.playerManager.setGrounded(false);
            }
        }

        // ばねの再描画
        this.draw();
    }

    public reset(): void {
        this.isCompressed = false;
        this.compressionTime = 0;
        this.draw();
    }

    public getSpringBounds(): PIXI.Rectangle {
        return this.spring.getBounds();
    }

    public setPosition(x: number, y: number): void {
        this.spring.x = x;
        this.spring.y = y;
    }
} 