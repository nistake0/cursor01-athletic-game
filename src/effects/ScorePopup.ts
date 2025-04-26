import * as PIXI from 'pixi.js';
import { Game } from '../game';

export class ScorePopup {
    private text: PIXI.Text;
    private container: PIXI.Container;
    private velocityY: number = -2;
    private alpha: number = 1;
    private fadeSpeed: number = 0.02;
    private lifeTime: number = 60; // フレーム数で指定
    private currentFrame: number = 0;

    constructor(
        private game: Game,
        score: number,
        x: number,
        y: number
    ) {
        this.container = new PIXI.Container();
        this.text = new PIXI.Text(`+${score}`, {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center',
            stroke: 0x000000,
            strokeThickness: 2
        });

        this.container.x = x;
        this.container.y = y - 20; // プレイヤーの少し上に表示
        this.container.addChild(this.text);
        this.game.getApp().stage.addChild(this.container);
    }

    update(): boolean {
        this.currentFrame++;
        this.container.y += this.velocityY;
        this.alpha = 1 - (this.currentFrame / this.lifeTime);
        this.text.alpha = this.alpha;
        
        if (this.currentFrame >= this.lifeTime) {
            this.container.destroy();
            return true;
        }
        return false;
    }
} 