import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';
import { Fountain } from './Fountain';

export class FountainSpawner extends Obstacle {
    private fountains: Fountain[] = [];
    private poolBounds: { x: number; y: number; width: number; height: number } = { x: 0, y: 0, width: 0, height: 0 };
    
    // 噴水を配置する範囲を定数で定義
    private readonly FOUNTAIN_AREA = {
        x: 50,  // 左端からの距離を調整
        y: 450,  // 地面からの高さ
        width: 700,  // 配置幅を適度に広げる
        height: 100
    };

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        super(app, obstacles, game);
        this.drawPriority = 1;  // 生成装置は最前面に描画
        this.initializeFountains();  // コンストラクタで初期化
    }

    public draw(): void {
        // 各噴水を描画
        for (const fountain of this.fountains) {
            fountain.draw();
        }
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        // 各噴水の衝突判定をチェック
        for (const fountain of this.fountains) {
            if (fountain.checkCollision(player)) {
                return true;
            }
        }
        return false;
    }

    public update(currentTime: number): void {
        // 噴水の更新
        for (const fountain of this.fountains) {
            fountain.update(currentTime);
        }
    }

    public reset(): void {
        // 噴水をリセット
        for (const fountain of this.fountains) {
            fountain.reset();
        }
    }

    private initializeFountains(): void {
        // 既存の噴水をクリア
        this.fountains = [];
        
        // 4つの噴水を生成
        const fountainCount = 4;
        const spacing = this.FOUNTAIN_AREA.width / (fountainCount + 1);
        
        for (let i = 0; i < fountainCount; i++) {
            const x = this.FOUNTAIN_AREA.x + spacing * (i + 1);
            const y = this.FOUNTAIN_AREA.y;
            
            // 各噴水に異なる速度を設定
            const waterSpeed = 0.3 + (i * 0.1);
            const platformSpeed = 0.2 + (i * 0.05);
            
            const fountain = new Fountain(this.app, this.obstacles, this.game, x, y, waterSpeed, platformSpeed);
            this.fountains.push(fountain);
        }
    }

    public getFountains(): Fountain[] {
        return this.fountains;
    }
} 