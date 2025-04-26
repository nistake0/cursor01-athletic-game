import * as PIXI from 'pixi.js';
import { OBSTACLES } from '../utils/constants';
import { PlayerManager } from '../managers/PlayerManager';
import { Obstacle } from './Obstacle';
import { Game } from '../game';

export class AppleSpawner extends Obstacle {
  private playerManager: PlayerManager;
  private apple: PIXI.Graphics | null = null;
  private spawnTimer: number | null = null;
  private hasSpawned: boolean = false;

  constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game, playerManager: PlayerManager) {
    super(app, obstacles, game);
    this.playerManager = playerManager;
    this.startSpawning();
  }

  public draw(): void {
    // スプライトは動的に生成されるため、ここでは何もしない
  }

  public checkCollision(player: PIXI.Graphics): boolean {
    if (!this.apple) return false;

    const playerBounds = player.getBounds();
    const appleBounds = this.apple.getBounds();
    if (playerBounds.x + playerBounds.width > appleBounds.x &&
        playerBounds.x < appleBounds.x + appleBounds.width &&
        playerBounds.y + playerBounds.height > appleBounds.y &&
        playerBounds.y < appleBounds.y + appleBounds.height) {
      console.log('りんごを取得しました:', { 
        player: { x: playerBounds.x, y: playerBounds.y },
        apple: { x: appleBounds.x, y: appleBounds.y }
      });
      this.obstacles.removeChild(this.apple);
      this.apple = null;
      this.addScore(OBSTACLES.APPLE.SCORE);
      return false;
    }
    return false;
  }

  public update(currentTime: number): void {
    // 衝突判定はcheckCollisionで行うため、ここでは何もしない
  }

  public reset(): void {
    this.cleanup();
    this.hasSpawned = false;
    this.startSpawning();
  }

  private startSpawning(): void {
    if (this.hasSpawned) return;

    const delay = Math.random() * 2000 + 5000; // 5-7秒
    console.log('りんごの生成を開始します。次回の生成まで:', delay, 'ms');
    this.spawnTimer = window.setTimeout(() => {
      this.spawnApple();
    }, delay);
  }

  private spawnApple(): void {
    if (this.apple) return; // 既にりんごが存在する場合は生成しない

    const apple = new PIXI.Graphics();
    apple.beginFill(0xFF0000); // 赤色
    apple.drawCircle(0, 0, 20); // 半径20の円
    apple.endFill();
    apple.beginFill(0x00FF00); // 緑色
    apple.drawRect(-5, -25, 10, 10); // 茎
    apple.endFill();

    const x = Math.random() * (OBSTACLES.APPLE.SPAWN_X_MAX - OBSTACLES.APPLE.SPAWN_X_MIN) + OBSTACLES.APPLE.SPAWN_X_MIN;
    apple.position.set(x, OBSTACLES.APPLE.SPAWN_Y);

    this.obstacles.addChild(apple);
    this.apple = apple;
    this.hasSpawned = true;
    console.log('りんごを生成しました:', { x, y: OBSTACLES.APPLE.SPAWN_Y });
  }

  private cleanup(): void {
    if (this.spawnTimer) {
      clearTimeout(this.spawnTimer);
      this.spawnTimer = null;
    }
    if (this.apple) {
      this.obstacles.removeChild(this.apple);
      this.apple = null;
    }
  }
} 