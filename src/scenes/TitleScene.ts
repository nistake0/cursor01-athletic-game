import * as PIXI from 'pixi.js';
import { Scene } from './types';

export class TitleScene implements Scene {
    private container: PIXI.Container;
    private gameTitle!: PIXI.Text;
    private startButton!: PIXI.Container;
    private background!: PIXI.Sprite;
    private isTransitioning: boolean = false;

    constructor() {
        this.container = new PIXI.Container();
        this.setupBackground();
        this.setupTitle();
        this.setupStartButton();
    }

    private setupBackground(): void {
        // 背景の設定（ゲーム中と同じ背景を使用）
        this.background = PIXI.Sprite.from('assets/background.png');
        this.background.width = 800; // 画面幅に合わせて調整
        this.background.height = 600; // 画面高さに合わせて調整
        this.container.addChild(this.background);
    }

    private setupTitle(): void {
        // ゲームタイトルの設定
        this.gameTitle = new PIXI.Text('Cursor Athletic', {
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xffffff,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 4
        });
        this.gameTitle.anchor.set(0.5);
        this.gameTitle.x = 400; // 画面中央
        this.gameTitle.y = 150; // 上に移動
        this.container.addChild(this.gameTitle);
    }

    private setupStartButton(): void {
        // スタートボタンの設定
        const button = new PIXI.Graphics();
        button.beginFill(0x4a90e2);
        button.drawRoundedRect(-100, -25, 200, 50, 10);
        button.endFill();

        const buttonText = new PIXI.Text('START', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xffffff
        });
        buttonText.anchor.set(0.5);

        this.startButton = new PIXI.Container();
        this.startButton.addChild(button);
        this.startButton.addChild(buttonText);
        this.startButton.x = 400; // 画面中央
        this.startButton.y = 450; // 下に移動
        this.startButton.interactive = true;
        (this.startButton as any).buttonMode = true;

        // ボタンのホバーエフェクト
        this.startButton.on('pointerover', () => {
            button.tint = 0x6ba8e6;
        });
        this.startButton.on('pointerout', () => {
            button.tint = 0xffffff;
        });

        this.container.addChild(this.startButton);
    }

    public getContainer(): PIXI.Container {
        return this.container;
    }

    public update(delta: number): void {
        // アニメーションやエフェクトがあればここで更新
    }

    public onStartButtonClick(callback: () => void): void {
        if (this.isTransitioning) return;
        
        this.startButton.on('pointerdown', () => {
            this.isTransitioning = true;
            // ワイプアニメーション
            const wipe = new PIXI.Graphics();
            wipe.beginFill(0x000000);
            this.container.addChild(wipe);

            let progress = 0;
            const animate = () => {
                progress += 0.05;
                wipe.clear();
                wipe.beginFill(0x000000);
                wipe.drawRect(0, 0, 800 * progress, 600);
                wipe.endFill();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    callback();
                }
            };
            animate();
        });
    }

    public destroy(): void {
        this.container.destroy({ children: true });
    }
} 