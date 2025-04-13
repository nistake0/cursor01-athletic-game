// ゲーム設定
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GRAVITY = 0.5;
export const JUMP_FORCE = -12;
export const MOVE_SPEED = 5;

// プレイヤー設定
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 60;
export const PLAYER_COLOR = 0x00FF00;
export const PLAYER_JUMP_COOLDOWN = 500; // ミリ秒

// 障害物設定
export const OBSTACLE_COLOR = 0xFF0000;
export const OBSTACLE_WIDTH = 50;
export const OBSTACLE_HEIGHT = 50;

// 魚の物理パラメータ
export const FISH_INITIAL_VELOCITY = -600;  // 画面の1/2まで到達するように調整
export const FISH_GRAVITY = 0.8;            // 重力加速度

// 画面遷移設定
export const WIPE_DURATION = 1000; // ミリ秒
export const WIPE_COLOR = 0x000000;

// 空の種類を定義
export enum SkyType {
    NONE = 'NONE',      // 空を描画しない
    NORMAL = 'NORMAL',  // 通常の空
    DARK = 'DARK',     // 真っ暗
    SUNSET = 'SUNSET'  // 夕焼け
}

export interface ScreenBackground {
    drawSky: SkyType;
    drawGround: boolean;
    drawGrass: boolean;
    drawTrees: boolean;
    drawForestCanopy: boolean;
    isInForest: boolean;
}

export const screenBackgrounds: { [key: number]: ScreenBackground } = {
    1: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
    2: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
    3: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
    4: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
    5: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
    6: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: true },
    7: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
    8: { drawSky: SkyType.DARK, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: true },
    9: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
    10: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
    11: { drawSky: SkyType.DARK, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: true },
    12: { drawSky: SkyType.SUNSET, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false }
};

export const BACKGROUND = {
    SKY_COLOR: 0x87CEEB,
    GROUND_COLOR: 0x8B4513,
    GRASS_COLOR: 0x228B22,
    FOREST_COLOR: 0x006400,
    FOREST_ALPHA: 0.5,
    TREE_COLOR: 0x2F4F4F,
    TREE_TRUNK_COLOR: 0x8B4513,
    GRADIENT_STEPS: 10,
    START_COLOR: 0x87CEEB,
    END_COLOR: 0x4682B4,
    TREE_MIN_HEIGHT: 100,
    TREE_MAX_HEIGHT: 200,
    TREE_MIN_WIDTH: 30,
    TREE_MAX_WIDTH: 60,
    TREE_OVERLAP: 0.8,
    SUNSET_START_COLOR: 0xFF7F50,
    SUNSET_END_COLOR: 0x4B0082
}; 