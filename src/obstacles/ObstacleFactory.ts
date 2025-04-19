import * as PIXI from 'pixi.js';
import { Game } from '../game';
import { Obstacle } from './Obstacle';
import { Rock } from './Rock';
import { Pool } from './Pool';
import { RollingRock } from './RollingRock';
import { Stump } from './Stump';
import { LargePool } from './LargePool';
import { LotusLeaf } from './LotusLeaf';
import { BeeSpawner } from './BeeSpawner';
import { ChestnutSpawner } from './ChestnutSpawner';
import { Signboard } from './Signboard';
import { FishSpawner } from './FishSpawner';
import { Spring } from './Spring';
import { SpringSpawner } from './SpringSpawner';
import { TarzanRope } from './TarzanRope';
import { BouncingRock } from './BouncingRock';
import { BouncingRockSpawner } from './BouncingRockSpawner';

export class ObstacleFactory {
    private app: PIXI.Application;
    private obstacles: PIXI.Graphics;
    private game: Game;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        this.app = app;
        this.obstacles = obstacles;
        this.game = game;
    }

    public createObstacle(type: string, x: number = 0, y: number = 0): Obstacle[] {
        switch (type) {
            case 'Rock':
                return [new Rock(this.app, this.obstacles, this.game)];
            case 'Pool':
                return [new Pool(this.app, this.obstacles, this.game)];
            case 'RollingRock':
                return [new RollingRock(this.app, this.obstacles, this.game)];
            case 'Stump':
                return [new Stump(this.app, this.obstacles, this.game)];
            case 'LargePool':
                return [new LargePool(this.app, this.obstacles, this.game)];
            case 'LotusLeaf':
                return [new LotusLeaf(this.app, this.obstacles, this.game)];
            case 'BeeSpawner':
                return [new BeeSpawner(this.app, this.obstacles, this.game)];
            case 'ChestnutSpawner':
                return [new ChestnutSpawner(this.app, this.obstacles, this.game)];
            case 'Signboard':
                return [new Signboard(this.app, this.obstacles, this.game)];
            case 'FishSpawner':
                return [new FishSpawner(this.app, this.obstacles, this.game)];
            case 'Spring':
                return [new Spring(this.app, this.obstacles, this.game, this.game.getPlayerManager())];
            case 'SpringSpawner':
                return [new SpringSpawner(this.app, this.obstacles, this.game, this.game.getPlayerManager())];
            case 'TarzanRope':
                // 画面の左右にロープを配置（少し中央に寄せる）
                const leftRope = new TarzanRope(this.app, this.obstacles, this.game, 250, 200, true);
                const rightRope = new TarzanRope(this.app, this.obstacles, this.game, 550, 200, false);
                return [leftRope, rightRope]; // 両方のロープを返す
            case 'BouncingRock':
                return [new BouncingRock(this.app, this.obstacles, this.game, 800, 450)];
            case 'BouncingRockSpawner':
                return [new BouncingRockSpawner(this.app, this.obstacles, this.game)];
            default:
                throw new Error(`Unknown obstacle type: ${type}`);
        }
    }

    public createObstacles(types: string[]): Obstacle[] {
        const obstacles: Obstacle[] = [];
        
        for (const type of types) {
            // 障害物の生成（配列を返す）
            const newObstacles = this.createObstacle(type);
            obstacles.push(...newObstacles);
        }
        
        return obstacles;
    }
} 