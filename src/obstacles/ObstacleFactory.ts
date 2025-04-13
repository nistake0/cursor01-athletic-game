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

export class ObstacleFactory {
    private app: PIXI.Application;
    private obstacles: PIXI.Graphics;
    private game: Game;

    constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
        this.app = app;
        this.obstacles = obstacles;
        this.game = game;
    }

    public createObstacle(type: string): Obstacle {
        switch (type) {
            case 'Rock':
                return new Rock(this.app, this.obstacles, this.game);
            case 'Pool':
                return new Pool(this.app, this.obstacles, this.game);
            case 'RollingRock':
                return new RollingRock(this.app, this.obstacles, this.game);
            case 'Stump':
                return new Stump(this.app, this.obstacles, this.game);
            case 'LargePool':
                return new LargePool(this.app, this.obstacles, this.game);
            case 'LotusLeaf':
                return new LotusLeaf(this.app, this.obstacles, this.game);
            case 'BeeSpawner':
                return new BeeSpawner(this.app, this.obstacles, this.game);
            case 'ChestnutSpawner':
                return new ChestnutSpawner(this.app, this.obstacles, this.game);
            case 'Signboard':
                return new Signboard(this.app, this.obstacles, this.game);
            case 'FishSpawner':
                return new FishSpawner(this.app, this.obstacles, this.game);
            case 'Spring':
                return new Spring(this.app, this.obstacles, this.game, this.game.getPlayerManager());
            case 'SpringSpawner':
                return new SpringSpawner(this.app, this.obstacles, this.game, this.game.getPlayerManager());
            default:
                throw new Error(`Unknown obstacle type: ${type}`);
        }
    }
} 