import * as PIXI from 'pixi.js';
import { Renderer } from './Renderer';
import { Game } from '../game';
import { SCREEN, BACKGROUND } from '../utils/constants';

export class BackgroundRenderer extends Renderer {
    private background: PIXI.Graphics;
    private trees: PIXI.Graphics[] = [];

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

    public render(): void {
        this.clear();
        this.drawBackground();
    }

    private drawBackground(): void {
        this.background.clear();
        this.drawSky();
        this.drawForestSilhouette();
        this.drawGround();
        this.drawGrass();
        this.drawForegroundTrees();
    }

    private drawSky(): void {
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

    private drawGround(): void {
        this.background.beginFill(SCREEN.GROUND_COLOR);
        this.background.drawRect(0, this.app.screen.height - 100, this.app.screen.width, 50);
        this.background.endFill();
    }

    private drawGrass(): void {
        this.background.beginFill(SCREEN.GRASS_COLOR);
        this.background.drawRect(0, this.app.screen.height - 110, this.app.screen.width, 10);
        for (let x = 0; x < this.app.screen.width; x += 15) {
            this.background.beginFill(SCREEN.GRASS_COLOR);
            const height = 5 + Math.random() * 15;
            this.background.drawRect(x, this.app.screen.height - 110 - height, 8, height);
            this.background.endFill();
        }
    }

    private drawForegroundTrees(): void {
        this.drawTree(100);
        this.drawTree(this.app.screen.width - 100);
    }

    private drawForestSilhouette(): void {
        this.background.beginFill(SCREEN.FOREST_COLOR, SCREEN.FOREST_ALPHA);
        
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
            
            x += treeWidth * BACKGROUND.TREE_OVERLAP; // 木々を少し重ねる
        }
        
        this.background.endFill();
    }

    private drawTree(x: number): void {
        this.drawTreeTrunk(x);
        this.drawTreeBranches(x);
        this.drawTreeLeaves(x);
    }

    private drawTreeTrunk(x: number): void {
        this.background.beginFill(0x8B4513);
        this.background.drawRect(x - 20, this.app.screen.height - 250, 40, 140);
        this.background.endFill();
    }

    private drawTreeBranches(x: number): void {
        this.background.lineStyle(20, 0x8B4513);
        this.background.moveTo(x, this.app.screen.height - 200);
        this.background.lineTo(x - 50, this.app.screen.height - 250);
        this.background.moveTo(x, this.app.screen.height - 180);
        this.background.lineTo(x + 50, this.app.screen.height - 230);
        this.background.lineStyle(0);
    }

    private drawTreeLeaves(x: number): void {
        const leafColors = [0x228B22, 0x32CD32, 0x006400]; // 異なる緑色

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
} 