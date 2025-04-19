import * as PIXI from 'pixi.js';
import { Obstacle } from './Obstacle';
import { Game } from '../game';
import { PLAYER } from '../utils/constants';

export class TarzanRope extends Obstacle {
  private ropeGraphics: PIXI.Graphics;
  private anchorPoint: PIXI.Point;
  private ropeLength: number;
  private swingAngle: number;
  private swingSpeed: number;
  private swingAmplitude: number;
  private isLeftRope: boolean;
  private x: number;
  private y: number;
  private rotation: number = 0;
  private isPlayerHolding: boolean = false;
  private playerVelocityY: number = 0;
  private invincibleUntil: number = 0; // 無敵時間の終了時刻
  private chainPoints: { x: number; y: number; vx: number; vy: number }[] = [];
  private readonly CHAIN_SEGMENTS = 12;
  private readonly DAMPING = 0.98;
  private readonly TENSION = 0.3;
  private readonly GRAVITY = 0.2;
  private readonly CONSTRAINT_ITERATIONS = 5; // 制約の適用回数を増やす（3→5）
  private readonly FIXED_POINT_Y = 200; // 固定点のY座標をさらに下げる（150→200）
  private readonly FIRST_SEGMENT_TENSION = 0.9; // 最初のセグメントの張力（強め）

  constructor(app: PIXI.Application, obstacles: PIXI.Graphics, game: Game, x: number, y: number, isLeftRope: boolean) {
    super(app, obstacles, game);
    this.isLeftRope = isLeftRope;
    this.ropeLength = 180; // ロープの長さを短くする（225→180）
    this.anchorPoint = new PIXI.Point(x, y);
    this.x = x;
    this.y = this.FIXED_POINT_Y; // 固定点のY座標を使用
    
    // 左右のロープで揺れの速さをずらす
    this.swingSpeed = isLeftRope ? 0.02 : 0.015; // 左側は速く、右側は遅く
    this.swingAmplitude = 6.0; // 揺れの振幅をさらに大きくする（4.0→6.0）
    this.swingAngle = 0;
    
    // ロープの描画用Graphics
    this.ropeGraphics = new PIXI.Graphics();
    this.obstacles.addChild(this.ropeGraphics);
    
    // チェーンの点を初期化
    for (let i = 0; i < this.CHAIN_SEGMENTS; i++) {
      this.chainPoints.push({
        x: x,
        y: this.y + (this.ropeLength / (this.CHAIN_SEGMENTS - 1)) * i,
        vx: 0,
        vy: 0
      });
    }
  }

  draw(): void {
    // ロープの揺れを更新
    this.swingAngle += this.swingSpeed;
    const swingOffset = Math.sin(this.swingAngle) * this.swingAmplitude;
    this.rotation = swingOffset;
    
    // チェーンの物理シミュレーション
    this.updateChainPhysics();
    
    // ロープの描画を更新
    this.ropeGraphics.clear();
    this.ropeGraphics.lineStyle(4, 0x4B9CD3);

    // チェーンの点を結んで描画
    for (let i = 0; i < this.chainPoints.length - 1; i++) {
      const current = this.chainPoints[i];
      const next = this.chainPoints[i + 1];
      
      if (i === 0) {
        this.ropeGraphics.moveTo(current.x, current.y);
      }
      this.ropeGraphics.lineTo(next.x, next.y);
    }
    
    // ロープの先端に丸を追加
    const endPoint = this.chainPoints[this.chainPoints.length - 1];
    this.ropeGraphics.beginFill(0x4B9CD3);
    this.ropeGraphics.drawCircle(endPoint.x, endPoint.y, 8);
    this.ropeGraphics.endFill();
  }

  private updateChainPhysics(): void {
    // 固定点（上部）の位置を更新
    this.chainPoints[0].x = this.x;
    this.chainPoints[0].y = this.y;
    this.chainPoints[0].vx = 0;
    this.chainPoints[0].vy = 0;

    // 揺れの力を上部に適用
    const swingForce = Math.sin(this.swingAngle) * this.swingAmplitude * 15; // 揺れの力をさらに強くする（12→15）
    this.chainPoints[1].vx += swingForce;

    // 各セグメントの物理シミュレーション
    for (let i = 1; i < this.chainPoints.length; i++) {
      const point = this.chainPoints[i];
      
      // 重力の適用
      point.vy += this.GRAVITY;
      
      // 速度の適用
      point.x += point.vx;
      point.y += point.vy;
      
      // 減衰
      point.vx *= this.DAMPING;
      point.vy *= this.DAMPING;
    }

    // セグメント間の距離制約を複数回適用
    for (let iteration = 0; iteration < this.CONSTRAINT_ITERATIONS; iteration++) {
      // 最初のセグメントの制約を特別に処理
      const firstPoint = this.chainPoints[0];
      const secondPoint = this.chainPoints[1];
      
      // 最初のセグメント間の距離を計算
      const dx = secondPoint.x - firstPoint.x;
      const dy = secondPoint.y - firstPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const targetDistance = this.ropeLength / (this.CHAIN_SEGMENTS - 1);
      
      if (distance > 0) {
        // 距離の差に基づいて位置を調整（最初のセグメントは強めの張力）
        const diff = (distance - targetDistance) / distance;
        const moveX = dx * diff * this.FIRST_SEGMENT_TENSION;
        const moveY = dy * diff * this.FIRST_SEGMENT_TENSION;
        
        // 最初のセグメントは固定点を動かさない
        secondPoint.x -= moveX;
        secondPoint.y -= moveY;
      }
      
      // 残りのセグメントの制約を処理
      for (let i = 2; i < this.chainPoints.length; i++) {
        const point = this.chainPoints[i];
        const prev = this.chainPoints[i - 1];
        
        // セグメント間の距離を計算
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetDistance = this.ropeLength / (this.CHAIN_SEGMENTS - 1);
        
        if (distance > 0) {
          // 距離の差に基づいて位置を調整
          const diff = (distance - targetDistance) / distance;
          const moveX = dx * diff * 0.7; // 移動量を増やす（0.5→0.7）
          const moveY = dy * diff * 0.7;
          
          // 両方の点を調整
          point.x -= moveX;
          point.y -= moveY;
          prev.x += moveX;
          prev.y += moveY;
        }
      }
    }

    // 固定点の位置を強制的に維持
    this.chainPoints[0].x = this.x;
    this.chainPoints[0].y = this.y;
    this.chainPoints[0].vx = 0;
    this.chainPoints[0].vy = 0;

    // 画面外に出ないように制限
    const screenHeight = this.app.screen.height;
    const groundY = screenHeight - 100; // 地面の位置（画面下端から100px上）
    
    for (const point of this.chainPoints) {
      // 画面下端の制限
      if (point.y > screenHeight - 50) {
        point.y = screenHeight - 50;
        point.vy *= -0.5; // 跳ね返り
      }
      
      // 地面の制限
      if (point.y > groundY) {
        point.y = groundY;
        point.vy *= -0.3; // 地面での跳ね返り（弱め）
      }
    }
  }

  update(currentTime: number): void {
    this.draw();
    
    // プレイヤーがロープにつかまっている場合の処理
    if (this.isPlayerHolding) {
      const player = this.game.getPlayerManager().getPlayer();
      if (player) {
        // ロープの先端の位置を取得（物理シミュレーションの結果を使用）
        const endPoint = this.chainPoints[this.chainPoints.length - 1];
        
        // プレイヤーの位置をロープの先端に合わせる
        player.x = endPoint.x;
        player.y = endPoint.y;
        
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

    // ロープの先端の位置を取得（物理シミュレーションの結果を使用）
    const endPoint = this.chainPoints[this.chainPoints.length - 1];
    
    // プレイヤーとロープの先端の距離を計算
    const dx = player.x - endPoint.x;
    const dy = player.y - endPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // プレイヤーがジャンプ中で、ロープの先端に近い場合にロープにつかまる
    if (distance < 30 && player.y < PLAYER.GROUND_Y) { // 判定範囲を広げる（20→30）
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
    
    // チェーンの点を初期化
    for (let i = 0; i < this.CHAIN_SEGMENTS; i++) {
      this.chainPoints.push({
        x: this.x,
        y: this.y + (this.ropeLength / (this.CHAIN_SEGMENTS - 1)) * i,
        vx: 0,
        vy: 0
      });
    }
  }
} 