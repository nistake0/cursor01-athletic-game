import * as PIXI from 'pixi.js';

export class SplashEffect {
    private particles: PIXI.Graphics[] = [];
    private velocities: { x: number; y: number }[] = [];
    private lifeTimes: number[] = [];
    private maxLifeTime: number = 30; // フレーム数
    private isActive: boolean = false;
    private container: PIXI.Container;

    constructor(app: PIXI.Application) {
        this.container = new PIXI.Container();
        app.stage.addChild(this.container);
    }

    public create(x: number, y: number, count: number = 10): void {
        this.isActive = true;
        
        // 既存のパーティクルをクリア
        this.clear();
        
        // 新しいパーティクルを作成
        for (let i = 0; i < count; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(0xFFFFFF, 0.8);
            particle.drawCircle(0, 0, 2);
            particle.endFill();
            
            // ランダムな方向に飛び散る
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed - 2 // 上向きの初期速度
            };
            
            particle.x = x;
            particle.y = y;
            
            this.container.addChild(particle);
            this.particles.push(particle);
            this.velocities.push(velocity);
            this.lifeTimes.push(0);
        }
    }

    public update(): void {
        if (!this.isActive) return;
        
        let allDead = true;
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const velocity = this.velocities[i];
            
            // 重力の影響
            velocity.y += 0.1;
            
            // 位置の更新
            particle.x += velocity.x;
            particle.y += velocity.y;
            
            // 寿命の更新
            this.lifeTimes[i]++;
            
            // 透明度の更新（徐々に透明に）
            const alpha = 1 - (this.lifeTimes[i] / this.maxLifeTime);
            particle.alpha = alpha;
            
            // サイズの更新（徐々に小さく）
            const scale = 1 - (this.lifeTimes[i] / this.maxLifeTime) * 0.5;
            particle.scale.set(scale);
            
            // 寿命が尽きたかチェック
            if (this.lifeTimes[i] < this.maxLifeTime) {
                allDead = false;
            }
        }
        
        // すべてのパーティクルが寿命を迎えたら非アクティブに
        if (allDead) {
            this.isActive = false;
        }
    }

    public clear(): void {
        for (const particle of this.particles) {
            this.container.removeChild(particle);
        }
        
        this.particles = [];
        this.velocities = [];
        this.lifeTimes = [];
    }

    public isEffectActive(): boolean {
        return this.isActive;
    }
} 