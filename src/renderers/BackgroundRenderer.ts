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
        this.drawTrees();
    }

    private drawBackground(): void {
        // グラデーション背景の描画
        const gradientSteps = BACKGROUND.GRADIENT_STEPS;
        const stepHeight = SCREEN.HEIGHT / gradientSteps;
        
        for (let i = 0; i < gradientSteps; i++) {
            const progress = i / (gradientSteps - 1);
            const color = this.interpolateColor(
                BACKGROUND.START_COLOR,
                BACKGROUND.END_COLOR,
                progress
            );
            
            this.background.beginFill(color);
            this.background.drawRect(
                0,
                i * stepHeight,
                SCREEN.WIDTH,
                stepHeight + 1
            );
            this.background.endFill();
        }

        // 地面の描画
        this.background.beginFill(SCREEN.GROUND_COLOR);
        this.background.drawRect(0, SCREEN.HEIGHT - 120, SCREEN.WIDTH, 120);
        this.background.endFill();

        // 芝生の描画
        this.background.beginFill(SCREEN.GRASS_COLOR);
        this.background.drawRect(0, SCREEN.HEIGHT - 120, SCREEN.WIDTH, 5);
        this.background.endFill();
    }

    private drawTrees(): void {
        // 森の背景（黒い半透明のオーバーレイ）
        const forestOverlay = new PIXI.Graphics();
        forestOverlay.beginFill(SCREEN.FOREST_COLOR, SCREEN.FOREST_ALPHA);
        forestOverlay.drawRect(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT);
        forestOverlay.endFill();
        this.app.stage.addChild(forestOverlay);
        this.trees.push(forestOverlay);

        // 木の描画
        const treeCount = Math.floor(SCREEN.WIDTH / 100);
        for (let i = 0; i < treeCount; i++) {
            const tree = new PIXI.Graphics();
            const height = Math.random() * (BACKGROUND.TREE_MAX_HEIGHT - BACKGROUND.TREE_MIN_HEIGHT) + BACKGROUND.TREE_MIN_HEIGHT;
            const width = Math.random() * (BACKGROUND.TREE_MAX_WIDTH - BACKGROUND.TREE_MIN_WIDTH) + BACKGROUND.TREE_MIN_WIDTH;
            const x = i * (SCREEN.WIDTH / treeCount) * BACKGROUND.TREE_OVERLAP;
            const y = SCREEN.HEIGHT - height;

            tree.beginFill(0x000000);
            tree.drawRect(x, y, width, height);
            tree.endFill();

            this.app.stage.addChild(tree);
            this.trees.push(tree);
        }
    }

    private interpolateColor(color1: number, color2: number, factor: number): number {
        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;
        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;

        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        return (r << 16) | (g << 8) | b;
    }
} 