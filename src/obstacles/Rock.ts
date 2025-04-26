import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';

export class Rock extends Obstacle {
    private player: PIXI.Graphics;
    private rock: PIXI.Graphics;
    private currentRockY: number = 0; // 現在の岩のY座標を保持
    private isScoreAdded: boolean = false; // スコア加算フラグ

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.player = game.getPlayer();
        
        // 岩のGraphicsオブジェクトを作成
        this.rock = new PIXI.Graphics();
        this.obstacles.addChild(this.rock);
    }

    // 岩の描画処理
    public draw(): void {
        this.rock.clear();
        
        // 岩の基本位置
        const baseX = 400;
        const baseY = this.app.screen.height - 80; // 20ピクセル下に移動
        const width = 60; // 岩の幅
        const height = 40; // 岩の高さ
        
        // 岩の本体（多角形で地面に接地している感じ）
        this.rock.beginFill(0x808080);
        this.rock.lineStyle(2, 0x000000);
        
        // 多角形の岩を描画（下側は水平な辺）
        this.rock.moveTo(baseX, baseY); // 左下
        this.rock.lineTo(baseX + width, baseY); // 右下
        
        // 右側の凹凸のある辺
        this.rock.lineTo(baseX + width - 5, baseY - 10);
        this.rock.lineTo(baseX + width - 10, baseY - 20);
        this.rock.lineTo(baseX + width - 5, baseY - 30);
        this.rock.lineTo(baseX + width - 15, baseY - 35);
        
        // 上部の凹凸のある辺
        this.rock.lineTo(baseX + width - 25, baseY - 40);
        this.rock.lineTo(baseX + width - 35, baseY - 35);
        this.rock.lineTo(baseX + width - 40, baseY - 40);
        this.rock.lineTo(baseX + width - 45, baseY - 35);
        
        // 左側の凹凸のある辺
        this.rock.lineTo(baseX + 15, baseY - 30);
        this.rock.lineTo(baseX + 10, baseY - 20);
        this.rock.lineTo(baseX + 15, baseY - 10);
        this.rock.lineTo(baseX, baseY); // 左下に戻る
        
        this.rock.endFill();
        
        // 岩の質感を表現する線と影
        // 暗い部分（影）
        this.rock.lineStyle(1, 0x404040);
        this.rock.moveTo(baseX + 10, baseY - 10);
        this.rock.lineTo(baseX + 50, baseY - 10);
        
        // 明るい部分（ハイライト）
        this.rock.lineStyle(1, 0xA0A0A0);
        this.rock.moveTo(baseX + 15, baseY - 15);
        this.rock.lineTo(baseX + 45, baseY - 15);
        
        // 表面の凹凸を表現する線
        this.rock.lineStyle(1, 0x606060);
        
        // 水平方向の線
        this.rock.moveTo(baseX + 20, baseY - 5);
        this.rock.lineTo(baseX + 40, baseY - 5);
        
        // 斜めの線
        this.rock.moveTo(baseX + 25, baseY - 20);
        this.rock.lineTo(baseX + 35, baseY - 10);
        
        // 小さな凹凸
        this.rock.beginFill(0x707070);
        this.rock.drawCircle(baseX + 30, baseY - 15, 2);
        this.rock.drawCircle(baseX + 35, baseY - 20, 1.5);
        this.rock.drawCircle(baseX + 25, baseY - 10, 1.5);
        this.rock.drawCircle(baseX + 40, baseY - 25, 2);
        this.rock.drawCircle(baseX + 15, baseY - 20, 1.5);
        this.rock.endFill();
    }

    // 岩の更新処理
    public update(currentTime: number): void {
        // 岩の位置を少し上下に揺らす
        this.currentRockY = this.app.screen.height - 80 + Math.sin(currentTime) * 5; // 20ピクセル下に移動
        
        // 岩を再描画
        this.draw();
    }

    // 岩との衝突判定
    public checkCollision(player: PIXI.Graphics): boolean {
        const playerBounds = {
            left: player.x - 15,
            right: player.x + 15,
            top: player.y - 35,
            bottom: player.y
        };

        // 多角形の岩の衝突判定（簡易的な矩形判定）
        const rockBounds = {
            left: 400,
            right: 460,
            top: this.currentRockY - 40, // 岩の高さを考慮
            bottom: this.currentRockY
        };

        // プレイヤーが岩を飛び越えたかチェック
        if (player.x > rockBounds.right && player.y < rockBounds.top) {
            this.addScore(10);
        }

        return !(playerBounds.right < rockBounds.left || 
                playerBounds.left > rockBounds.right || 
                playerBounds.bottom < rockBounds.top || 
                playerBounds.top > rockBounds.bottom);
    }

    // 岩のリセット処理
    public reset(): void {
        // 岩のGraphicsオブジェクトをクリア
        this.rock.clear();
        
        // 親オブジェクトから削除
        if (this.rock.parent) {
            this.rock.parent.removeChild(this.rock);
        }
        
        // 新しいGraphicsオブジェクトを作成
        this.rock = new PIXI.Graphics();
        this.obstacles.addChild(this.rock);

        // スコアをリセット
        this.resetScore();
    }
} 