// プレイヤー関連
export const PLAYER = {
  MOVE_SPEED: 5,
  JUMP_FORCE: -10,
  GRAVITY: 0.5,
  INITIAL_X: 50,
  INITIAL_Y: 480, // SCREEN.HEIGHT - 120
  GROUND_Y: 480, // SCREEN.HEIGHT - 120
};

// 魚関連
export const FISH_INITIAL_VELOCITY = -600;  // 画面の1/2まで到達するように調整
export const FISH_GRAVITY = 0.8;            // 重力加速度

// 画面関連
export const SCREEN = {
  WIDTH: 800,
  HEIGHT: 600,
  BACKGROUND_COLOR: 0x87CEEB, // 空色
  GROUND_COLOR: 0xCCCCCC,
  GRASS_COLOR: 0x33CC33,
  FOREST_COLOR: 0x000000,
  FOREST_ALPHA: 0.8,
};

// 障害物関連
export const OBSTACLES = {
  CHESTNUT: {
    SPAWN_INTERVAL: 1000, // 1秒
    MAX_COUNT: 3,
    SPAWN_X: 800,
    SPAWN_Y: 300
  },
  BEE: {
    SPAWN_INTERVAL: 2000, // 2秒
  },
};

// テキスト関連
export const TEXT = {
  SCREEN: {
    FONT_FAMILY: 'Arial',
    FONT_SIZE: 24,
    FILL: 0xFFFFFF,
    STROKE: 0x000000,
    STROKE_THICKNESS: 4,
  },
  GAME_OVER: {
    FONT_FAMILY: 'Arial',
    FONT_SIZE: 48,
    FILL: 0xFF0000,
    STROKE: 0x000000,
    STROKE_THICKNESS: 6,
  },
};

// 背景関連
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
  1: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: false, isInForest: false },
  2: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: false, isInForest: false },
  3: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: false, isInForest: false },
  4: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: false, isInForest: false },
  5: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: false, isInForest: false },
  6: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: true },
  7: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
  8: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: true },
  9: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
  10: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
  11: { drawSky: SkyType.NORMAL, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: true },
  12: { drawSky: SkyType.SUNSET, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: false },
  13: { drawSky: SkyType.SUNSET, drawGround: true, drawGrass: true, drawTrees: true, drawForestCanopy: true, isInForest: true }
};

export const SPRING = {
  WIDTH: 40,
  HEIGHT: 30,  // 切り株のような高さに調整
  BOUNCE_VELOCITY: -15,  // ばねの跳ね返り力（更新）
  BOUNCE_WINDOW: 100,  // ミリ秒単位でのジャンプ入力受付時間
};

export const screenObjects = {
  13: {
    springs: [
      { x: 400 }  // 画面中央に1つだけ配置
    ]
  }
}; 