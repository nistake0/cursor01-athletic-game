import * as PIXI from 'pixi.js';
import { Renderer } from './Renderer';
import { Game } from '../game';
import { BACKGROUND, screenConfigs, SkyType } from '../utils/constants';

export class BackgroundRenderer extends Renderer {
    private background: PIXI.Graphics;
    private trees: PIXI.Graphics[] = [];
    private currentScreen: number = 1;

    constructor(app: PIXI.Application, game: Game) {
        super(app, game);
        this.background = new PIXI.Graphics();
        this.app.stage.addChild(this.background);
    }

    protected clear(): void {
        this.background.clear();
        this.trees.forEach(tree => {
            this.app.stage.removeChild(tree);
        });
        this.trees = [];
    }

    public setScreen(screenNumber: number): void {
        this.currentScreen = screenNumber;
        this.clear();
        this.drawBackground();
    }

    public render(): void {
        this.clear();
        this.drawBackground();
    }

    private drawBackground(): void {
        this.background.clear();
        const screenConfig = screenConfigs[this.currentScreen];
        if (!screenConfig) return;

        const settings = screenConfig.background;

        if (settings.drawSky !== SkyType.NONE) {
            this.drawSky(settings.drawSky);
        }
        if (settings.drawForestCanopy) {
            this.drawForestSilhouette();
        }
        if (settings.drawGround) {
            this.drawGround();
        }
        if (settings.drawGrass) {
            this.drawGrass();
        }
        if (settings.drawTrees) {
            this.drawForegroundTrees();
        }
    }

    private drawSky(skyType: SkyType): void {
        switch (skyType) {
            case SkyType.NORMAL:
                this.drawNormalSky();
                break;
            case SkyType.DARK:
                this.drawDarkSky();
                break;
            case SkyType.SUNSET:
                this.drawSunsetSky();
                break;
            case SkyType.NIGHT:
                this.drawNightSky();
                break;
        }
    }

    private drawNormalSky(): void {
        const height = this.app.screen.height;
        const steps = BACKGROUND.GRADIENT_STEPS;
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const startColor = BACKGROUND.START_COLOR;
            const endColor = BACKGROUND.END_COLOR;
            const color = this.lerpColor(startColor, endColor, ratio);
            
            this.background.beginFill(color);
            this.background.drawRect(
                0,
                (height * i) / steps,
                this.app.screen.width,
                height / steps + 1
            );
            this.background.endFill();
        }
    }

    private drawDarkSky(): void {
        this.background.beginFill(0x000000);
        this.background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        this.background.endFill();
    }

    private drawSunsetSky(): void {
        const height = this.app.screen.height;
        const steps = BACKGROUND.GRADIENT_STEPS;
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const startColor = BACKGROUND.SUNSET_START_COLOR;
            const endColor = BACKGROUND.SUNSET_END_COLOR;
            const color = this.lerpColor(startColor, endColor, ratio);
            
            this.background.beginFill(color);
            this.background.drawRect(
                0,
                (height * i) / steps,
                this.app.screen.width,
                height / steps + 1
            );
            this.background.endFill();
        }
    }

    private drawNightSky(): void {
        const height = this.app.screen.height;
        const steps = BACKGROUND.GRADIENT_STEPS;
        
        // 夜空のグラデーションを描画
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const startColor = BACKGROUND.NIGHT_START_COLOR;
            const endColor = BACKGROUND.NIGHT_END_COLOR;
            const color = this.lerpColor(startColor, endColor, ratio);
            
            this.background.beginFill(color);
            this.background.drawRect(
                0,
                (height * i) / steps,
                this.app.screen.width,
                height / steps + 1
            );
            this.background.endFill();
        }
        
        // 星を描画
        this.background.beginFill(BACKGROUND.STAR_COLOR);
        for (let i = 0; i < BACKGROUND.STAR_COUNT; i++) {
            const x = Math.random() * this.app.screen.width;
            const y = Math.random() * (height * 0.8); // 画面の上部80%に星を配置
            const size = 1 + Math.random() * 2; // 星の大きさをランダムに
            
            this.background.drawCircle(x, y, size);
        }
        this.background.endFill();
    }

    private drawGround(): void {
        const groundStartY = this.app.screen.height - 100;
        const groundHeight = 100;
        const steps = 10;

        // グラデーションで地面を描画
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const startColor = BACKGROUND.GROUND_COLOR;
            const endColor = this.darkenColor(BACKGROUND.GROUND_COLOR, 0.3); // 30%暗く
            const color = this.lerpColor(startColor, endColor, ratio);
            
            this.background.beginFill(color);
            this.background.drawRect(
                0,
                groundStartY + (groundHeight * i) / steps,
                this.app.screen.width,
                groundHeight / steps + 1
            );
            this.background.endFill();
        }
    }

    private drawGrass(): void {
        this.background.beginFill(BACKGROUND.GRASS_COLOR);
        this.background.drawRect(0, this.app.screen.height - 110, this.app.screen.width, 10);
        for (let x = 0; x < this.app.screen.width; x += 15) {
            this.background.beginFill(BACKGROUND.GRASS_COLOR);
            const height = 5 + Math.random() * 15;
            this.background.drawRect(x, this.app.screen.height - 110 - height, 8, height);
            this.background.endFill();
        }
    }

    private drawForegroundTrees(): void {
        const screenConfig = screenConfigs[this.currentScreen];
        if (!screenConfig) return;

        const settings = screenConfig.background;
        
        if (settings.isInForest) {
            // 森の中の場合、木を密集して描画
            const treeCount = 15; // 木の本数を増やす
            const spacing = this.app.screen.width / (treeCount + 1);
            
            for (let i = 1; i <= treeCount; i++) {
                const x = spacing * i;
                // 木の位置を少しランダムにずらして自然な感じに
                const offsetX = (Math.random() - 0.5) * 30;
                this.drawTree(x + offsetX);
            }
        } else {
            // 通常の描画（左右に1本ずつ）
            this.drawTree(100);
            this.drawTree(this.app.screen.width - 100);
        }
    }

    private drawForestSilhouette(): void {
        this.background.beginFill(BACKGROUND.FOREST_COLOR, BACKGROUND.FOREST_ALPHA);
        
        // 不規則な森のシルエットを作成
        let x = 0;
        while (x < this.app.screen.width) {
            const treeHeight = BACKGROUND.TREE_MIN_HEIGHT + Math.random() * (BACKGROUND.TREE_MAX_HEIGHT - BACKGROUND.TREE_MIN_HEIGHT);
            const treeWidth = BACKGROUND.TREE_MIN_WIDTH + Math.random() * (BACKGROUND.TREE_MAX_WIDTH - BACKGROUND.TREE_MIN_WIDTH);
            
            // 木の形を描く
            this.background.moveTo(x, this.app.screen.height - 110);
            this.background.lineTo(x + treeWidth/2, this.app.screen.height - 110 - treeHeight);
            this.background.lineTo(x + treeWidth, this.app.screen.height - 110);
            this.background.lineTo(x, this.app.screen.height - 110);
            
            x += treeWidth * BACKGROUND.TREE_OVERLAP;
        }
        
        this.background.endFill();
    }

    private drawTree(x: number): void {
        this.drawTreeTrunk(x);
        this.drawTreeBranches(x);
        this.drawTreeLeaves(x);
    }

    private drawTreeTrunk(x: number): void {
        const trunkWidth = 40;
        const trunkHeight = 140;
        const trunkY = this.app.screen.height - 250;
        const steps = 5;

        // 幹のグラデーションを描画
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const startColor = BACKGROUND.TREE_TRUNK_COLOR;
            const endColor = this.darkenColor(BACKGROUND.TREE_TRUNK_COLOR, 0.2); // 20%暗く
            const color = this.lerpColor(startColor, endColor, ratio);
            
            this.background.beginFill(color);
            this.background.drawRect(
                x - trunkWidth/2 + (trunkWidth * i) / steps,
                trunkY,
                trunkWidth / steps + 1,
                trunkHeight
            );
            this.background.endFill();
        }
    }

    private drawTreeBranches(x: number): void {
        this.background.lineStyle(20, BACKGROUND.TREE_TRUNK_COLOR);
        this.background.moveTo(x, this.app.screen.height - 200);
        this.background.lineTo(x - 50, this.app.screen.height - 250);
        this.background.moveTo(x, this.app.screen.height - 180);
        this.background.lineTo(x + 50, this.app.screen.height - 230);
        this.background.lineStyle(0);
    }

    private drawTreeLeaves(x: number): void {
        const leafColors = [BACKGROUND.TREE_COLOR, 0x32CD32, BACKGROUND.FOREST_COLOR];

        // メインの葉っぱの塊
        for (let i = 0; i < 3; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            this.background.beginFill(leafColors[i % leafColors.length]);
            this.background.drawCircle(x + offsetX, this.app.screen.height - 280 + offsetY, 50);
            this.background.endFill();
        }

        // 枝の先の葉っぱ
        this.background.beginFill(leafColors[0]);
        this.background.drawCircle(x - 50, this.app.screen.height - 260, 30);
        this.background.endFill();

        this.background.beginFill(leafColors[1]);
        this.background.drawCircle(x + 50, this.app.screen.height - 240, 30);
        this.background.endFill();

        // 葉っぱの細部（ハイライト）
        this.background.beginFill(0x90EE90);
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40;
            const size = 5 + Math.random() * 10;
            this.background.drawCircle(
                x + Math.cos(angle) * distance,
                this.app.screen.height - 280 + Math.sin(angle) * distance,
                size
            );
        }
        this.background.endFill();
    }

    private lerpColor(start: number, end: number, ratio: number): number {
        const r1 = (start >> 16) & 0xFF;
        const g1 = (start >> 8) & 0xFF;
        const b1 = start & 0xFF;

        const r2 = (end >> 16) & 0xFF;
        const g2 = (end >> 8) & 0xFF;
        const b2 = end & 0xFF;

        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);

        return (r << 16) | (g << 8) | b;
    }

    private darkenColor(color: number, factor: number): number {
        const r = Math.floor(((color >> 16) & 0xFF) * (1 - factor));
        const g = Math.floor(((color >> 8) & 0xFF) * (1 - factor));
        const b = Math.floor((color & 0xFF) * (1 - factor));
        return (r << 16) | (g << 8) | b;
    }
} 