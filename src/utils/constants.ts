// プレイヤー関連
export const PLAYER = {
  MOVE_SPEED: 5,
  JUMP_FORCE: -12,
  GRAVITY: 0.5,
  INITIAL_X: 50,
  INITIAL_Y: 480, // SCREEN.HEIGHT - 120
  GROUND_Y: 480, // SCREEN.HEIGHT - 120
};

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
  GRADIENT_STEPS: 20,
  START_COLOR: 0x87CEEB, // 空色
  END_COLOR: 0x4682B4,   // より濃い青
  TREE_MIN_HEIGHT: 150,
  TREE_MAX_HEIGHT: 250,
  TREE_MIN_WIDTH: 40,
  TREE_MAX_WIDTH: 70,
  TREE_OVERLAP: 0.7,
  SUNSET_START_COLOR: 0xFF7F50,  // 夕焼けの開始色
  SUNSET_END_COLOR: 0x1a1a2e,    // 夕焼けの終了色
  FOREST_COLOR: 0x2d2d44,        // 森の中の背景色
  FOREST_ALPHA: 0.8
};

export type SkyType = 'normal' | 'sunset' | 'dark';

export interface ScreenBackground {
    sky: SkyType;
    forest: boolean;
}

export const SCREEN_BACKGROUNDS: { [key: number]: ScreenBackground } = {
    1: { sky: 'normal', forest: false },
    2: { sky: 'normal', forest: false },
    3: { sky: 'normal', forest: false },
    4: { sky: 'normal', forest: true },
    5: { sky: 'sunset', forest: false },
    6: { sky: 'normal', forest: true },
    7: { sky: 'sunset', forest: false },
    8: { sky: 'normal', forest: true },
    9: { sky: 'normal', forest: false },
    10: { sky: 'dark', forest: false },
    11: { sky: 'normal', forest: true },
    12: { sky: 'normal', forest: false }
}; 