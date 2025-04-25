import * as PIXI from 'pixi.js';

export interface Scene {
    getContainer(): PIXI.Container;
    update(delta: number): void;
    destroy(): void;
} 