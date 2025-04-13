import * as PIXI from 'pixi.js';

export class WipeEffect {
    private app: PIXI.Application;
    private wipeGraphics: PIXI.Graphics;
    private isWiping: boolean = false;
    private wipeProgress: number = 0;
    private wipeSpeed: number = 0.05;
    private onComplete: () => void;
    private isFadingIn: boolean = false;

    constructor(app: PIXI.Application, onComplete: () => void) {
        this.app = app;
        this.onComplete = onComplete;
        
        // ワイプ用の黒い矩形を作成
        this.wipeGraphics = new PIXI.Graphics();
        this.wipeGraphics.beginFill(0x000000);
        this.wipeGraphics.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        this.wipeGraphics.endFill();
        
        // 最初は非表示
        this.wipeGraphics.alpha = 0;
        
        // ステージに追加
        this.app.stage.addChild(this.wipeGraphics);
    }

    public start(): void {
        this.isWiping = true;
        this.isFadingIn = false;
        this.wipeProgress = 0;
        this.wipeGraphics.alpha = 1;
        
        // 画面全体を黒くする
        this.wipeGraphics.clear();
        this.wipeGraphics.beginFill(0x000000);
        this.wipeGraphics.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        this.wipeGraphics.endFill();
    }

    public update(): void {
        if (!this.isWiping) return;

        if (!this.isFadingIn) {
            // 右から左へ幕が広がる
            this.wipeProgress += this.wipeSpeed;
            
            if (this.wipeProgress >= 1) {
                // 幕が完全に広がった
                this.wipeProgress = 1;
                this.isFadingIn = true;
                this.onComplete();
            }
            
            // 幕の位置を更新
            this.wipeGraphics.clear();
            this.wipeGraphics.beginFill(0x000000);
            this.wipeGraphics.drawRect(
                this.app.screen.width * (1 - this.wipeProgress),
                0,
                this.app.screen.width * this.wipeProgress,
                this.app.screen.height
            );
            this.wipeGraphics.endFill();
        } else {
            // 右から左へ幕が引けていく
            this.wipeProgress -= this.wipeSpeed;
            
            if (this.wipeProgress <= 0) {
                // 幕が完全に引けた
                this.wipeProgress = 0;
                this.isWiping = false;
                this.isFadingIn = false;
                this.wipeGraphics.clear();
            } else {
                // 幕の位置を更新
                this.wipeGraphics.clear();
                this.wipeGraphics.beginFill(0x000000);
                this.wipeGraphics.drawRect(
                    0,
                    0,
                    this.app.screen.width * this.wipeProgress,
                    this.app.screen.height
                );
                this.wipeGraphics.endFill();
            }
        }
    }

    public isActive(): boolean {
        return this.isWiping || this.isFadingIn;
    }
} 