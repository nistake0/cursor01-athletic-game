import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Spring } from './Spring';
import { SCREEN } from '../utils/constants';
import { PlayerManager } from '../managers/PlayerManager';
import { Obstacle } from './Obstacle';

export class SpringSpawner extends Obstacle {
    private springs: Spring[] = [];
    private readonly SPRING_COUNT = 4;
    private playerManager: PlayerManager;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game, playerManager: PlayerManager) {
        super(app, obstacles, game);
        this.playerManager = playerManager;
        this.spawnSprings();
    }

    private spawnSprings(): void {
        // 画面幅を等分して4つのばねを配置
        const spacing = SCREEN.WIDTH / (this.SPRING_COUNT + 1);
        
        for (let i = 1; i <= this.SPRING_COUNT; i++) {
            const x = spacing * i;
            const spring = new Spring(this.app, this.obstacles, this.game, this.playerManager);
            spring.setPosition(x, SCREEN.HEIGHT - 85);
            this.springs.push(spring);
        }
    }

    public update(currentTime: number): void {
        this.springs.forEach(spring => {
            spring.update(currentTime);
        });
    }

    public reset(): void {
        this.springs.forEach(spring => {
            spring.reset();
        });
    }

    public draw(): void {
        // SpringSpawner自体は描画しない
    }

    public checkCollision(player: PIXI.Graphics): boolean {
        // 各ばねとの衝突をチェック
        return this.springs.some(spring => spring.checkCollision(player));
    }

    public getDrawPriority(): number {
        return 0; // 通常の優先度
    }
} 