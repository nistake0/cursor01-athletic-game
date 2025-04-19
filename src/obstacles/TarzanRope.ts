import * as PIXI from 'pixi.js';
import { Obstacle } from './Obstacle';
import { Game } from '../game';
import { PLAYER } from '../utils/constants';

export class TarzanRope extends Obstacle {
  private ropeGraphics: PIXI.Graphics;
  private anchorPoint: PIXI.Point;
  private ropeLength: number;
  private swingAngle: number = 0;
  private swingSpeed: number;
  private swingAmplitude: number = 0.7;
  private isLeftRope: boolean;
  private x: number;
  private y: number;
  private rotation: number = 0;
  private isPlayerHolding: boolean = false;
  private playerVelocityY: number = 0;
  private invincibleUntil: number = 0; // 無敵時間の終了時刻

  constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game, x: number, y: number, isLeftRope: boolean) {
    super(app, obstacles, game);
    this.isLeftRope = isLeftRope;
    this.ropeLength = 225; // ロープの長さを50%増加（150→225）
    this.anchorPoint = new PIXI.Point(x, y);
    this.x = x;
    this.y = y;
    
    // 左右のロープで揺れの速さをずらす
    this.swingSpeed = isLeftRope ? 0.02 : 0.015; // 左側は速く、右側は遅く
    
    // ロープの描画用Graphics
    this.ropeGraphics = new PIXI.Graphics();
    this.obstacles.addChild(this.ropeGraphics);
  }

  draw(): void {
    // ロープの揺れを更新
    this.swingAngle += this.swingSpeed;
    const swingOffset = Math.sin(this.swingAngle) * this.swingAmplitude;
    this.rotation = swingOffset;
    
    // ロープの先端の位置を計算
    const endX = Math.sin(swingOffset) * this.ropeLength;
    const endY = Math.cos(swingOffset) * this.ropeLength;
    
    // ロープの描画を更新
    this.ropeGraphics.clear();
    this.ropeGraphics.lineStyle(4, 0x4B9CD3); // 明るい青色のロープ
    this.ropeGraphics.moveTo(this.x, this.y);
    this.ropeGraphics.lineTo(this.x + endX, this.y + endY);
    
    // ロープの先端に丸を追加
    this.ropeGraphics.beginFill(0x4B9CD3);
    this.ropeGraphics.drawCircle(this.x + endX, this.y + endY, 8);
    this.ropeGraphics.endFill();
  }

  update(currentTime: number): void {
    this.draw();
    
    // プレイヤーがロープにつかまっている場合の処理
    if (this.isPlayerHolding) {
      const player = this.game.getPlayerManager().getPlayer();
      if (player) {
        // ロープの先端の位置を計算
        const endX = this.x + Math.sin(this.rotation) * this.ropeLength;
        const endY = this.y + Math.cos(this.rotation) * this.ropeLength;
        
        // プレイヤーの位置をロープの先端に合わせる
        player.x = endX;
        player.y = endY;
        
        // プレイヤーの垂直方向の速度をロープの揺れに合わせる
        this.playerVelocityY = Math.cos(this.swingAngle) * this.swingSpeed * this.ropeLength;
        this.game.getPlayerManager().setVelocityY(this.playerVelocityY);
      }
    }
  }

  checkCollision(player: PIXI.Container): boolean {
    // 無敵時間中は掴めない
    if (Date.now() < this.invincibleUntil) {
      return false;
    }

    // ロープの先端の位置を計算
    const endX = this.x + Math.sin(this.rotation) * this.ropeLength;
    const endY = this.y + Math.cos(this.rotation) * this.ropeLength;
    
    // プレイヤーとロープの先端の距離を計算
    const dx = player.x - endX;
    const dy = player.y - endY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // プレイヤーがジャンプ中で、ロープの先端に近い場合にロープにつかまる
    if (distance < 20 && player.y < PLAYER.GROUND_Y) {
      this.isPlayerHolding = true;
      return true;
    }
    
    return false;
  }

  // ロープから離れる
  releasePlayer(): void {
    this.isPlayerHolding = false;
    // 無敵時間を設定（1秒間）
    this.invincibleUntil = Date.now() + 1000;
  }

  // プレイヤーがロープにつかまっているかどうかを取得
  isHoldingPlayer(): boolean {
    return this.isPlayerHolding;
  }

  reset(): void {
    this.swingAngle = 0;
    this.rotation = 0;
    this.isPlayerHolding = false;
    this.invincibleUntil = 0;
    // ロープのグラフィックスをクリア
    this.ropeGraphics.clear();
    // 親コンテナからロープを削除
    if (this.obstacles.children.includes(this.ropeGraphics)) {
      this.obstacles.removeChild(this.ropeGraphics);
    }
    // 新しいグラフィックスを作成
    this.ropeGraphics = new PIXI.Graphics();
    this.obstacles.addChild(this.ropeGraphics);
  }
} 