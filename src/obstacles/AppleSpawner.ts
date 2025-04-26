import * as PIXI from 'pixi.js';
import { OBSTACLES } from '../utils/constants';
import { PlayerManager } from '../managers/PlayerManager';
import { Obstacle } from './Obstacle';
import { Game } from '../game';

export class AppleSpawner extends Obstacle {
  private apples: PIXI.Graphics[] = [];
  private readonly maxCount: number = 1; // 1画面に1つだけ
  private readonly minSpawnDelay: number = 4000; // 4秒
  private readonly maxSpawnDelay: number = 8000; // 8秒
  private lastSpawnTime: number = 0;
  private nextSpawnDelay: number = 0;
  private readonly appleHeight: number = 200; // リンゴの固定高さ
  private isFirstSpawn: boolean = true; // 初回出現フラグ
  private gameStartTime: number = 0; // ゲーム開始時間

  constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game) {
    super(app, obstacles, game);
    this.gameStartTime = Date.now();
    this.setNextSpawnDelay();
  }

  private setNextSpawnDelay(): void {
    if (this.isFirstSpawn) {
      // 初回のみ4-8秒のランダム時間
      this.nextSpawnDelay = Math.random() * (this.maxSpawnDelay - this.minSpawnDelay) + this.minSpawnDelay;
      this.isFirstSpawn = false;
    } else {
      // 2回目以降は出現しない
      this.nextSpawnDelay = Number.MAX_SAFE_INTEGER;
    }
  }

  public draw(): void {
    // スプライトは動的に生成されるため、ここでは何もしない
  }

  public checkCollision(player: PIXI.Graphics): boolean {
    for (let i = this.apples.length - 1; i >= 0; i--) {
      const apple = this.apples[i];
      const playerBounds = player.getBounds();
      const appleBounds = apple.getBounds();

      if (playerBounds.x + playerBounds.width > appleBounds.x &&
        playerBounds.x < appleBounds.x + appleBounds.width &&
        playerBounds.y + playerBounds.height > appleBounds.y &&
        playerBounds.y < appleBounds.y + appleBounds.height) {
        // 衝突したらリンゴを削除してスコアを追加
        this.obstacles.removeChild(apple);
        this.apples.splice(i, 1);
        this.addScore(100);
        return false; // プレイヤーは死なない
      }
    }
    return false;
  }

  public update(delta: number): void {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.gameStartTime;
    
    // 4秒経過後かつ一定時間経過後にリンゴを生成
    if (elapsedTime >= this.minSpawnDelay && 
        currentTime - this.lastSpawnTime >= this.nextSpawnDelay && 
        this.apples.length < this.maxCount) {
      this.spawnApple();
      this.lastSpawnTime = currentTime;
      this.setNextSpawnDelay();
    }

    // リンゴの更新（落下しない）
    for (let i = this.apples.length - 1; i >= 0; i--) {
      const apple = this.apples[i];
      // リンゴは固定高さに留まる
      apple.y = this.appleHeight;

      // 画面外に出たら削除（x座標のみチェック）
      if (apple.x < -20 || apple.x > this.app.screen.width + 20) {
        this.obstacles.removeChild(apple);
        this.apples.splice(i, 1);
      }
    }
  }

  private spawnApple(): void {
    const apple = new PIXI.Graphics();
    
    // リンゴの本体（赤色）
    apple.beginFill(0xFF0000);
    apple.drawCircle(0, 0, 15);
    apple.endFill();

    // リンゴの葉（緑色）
    apple.beginFill(0x00FF00);
    apple.drawPolygon([
      -5, -15,
      0, -20,
      5, -15
    ]);
    apple.endFill();

    // リンゴの茎（茶色）
    apple.beginFill(0x8B4513);
    apple.drawRect(-1, -20, 2, 5);
    apple.endFill();

    // リンゴのハイライト（白色）
    apple.beginFill(0xFFFFFF, 0.5);
    apple.drawCircle(-5, -5, 5);
    apple.endFill();

    // 画面の上部からランダムな位置に生成（ばねジャンプで届く高さ）
    apple.x = Math.random() * (this.app.screen.width - 20) + 10;
    apple.y = this.appleHeight;

    this.obstacles.addChild(apple);
    this.apples.push(apple);
  }

  public reset(): void {
    // 既存のリンゴを削除
    for (const apple of this.apples) {
      this.obstacles.removeChild(apple);
    }
    this.apples = [];
    this.lastSpawnTime = 0;
    this.gameStartTime = Date.now(); // ゲーム開始時間をリセット
    this.isFirstSpawn = true; // 初回出現フラグをリセット
    this.setNextSpawnDelay();
  }
} 