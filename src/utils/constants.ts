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
  BACKGROUND_COLOR: 0x000000,
  GROUND_COLOR: 0xCCCCCC,
  GRASS_COLOR: 0x33CC33,
  FOREST_COLOR: 0x000000,
  FOREST_ALPHA: 0.8,
  SCREEN_CONFIGS: {
    1: { background: 'forest', obstacles: ['rock', 'rock', 'rock'] },
    2: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock'] },
    3: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock'] },
    4: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    5: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    6: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    7: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    8: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    9: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    10: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    11: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    12: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    13: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    14: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    15: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    16: { background: 'forest', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    17: { background: 'night', obstacles: ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'] },
    18: { background: 'night', obstacles: ['BouncingRockSpawner'] },
    19: { background: 'night', obstacles: ['Rock', 'RollingRock', 'ChestnutSpawner'] }
  }
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
  SUNSET_END_COLOR: 0x4B0082,
  NIGHT_START_COLOR: 0x000033,  // 濃い青色
  NIGHT_END_COLOR: 0x191970,    // ミッドナイトブルー
  STAR_COLOR: 0xFFFFFF,         // 星の色
  STAR_COUNT: 100               // 星の数
};

// 空の種類を定義
export enum SkyType {
  NONE = 'NONE',      // 空を描画しない
  NORMAL = 'NORMAL',  // 通常の空
  DARK = 'DARK',     // 真っ暗
  SUNSET = 'SUNSET',  // 夕焼け
  NIGHT = 'NIGHT'    // 夜景
}

export interface ScreenBackground {
  drawSky: SkyType;
  drawGround: boolean;
  drawGrass: boolean;
  drawTrees: boolean;
  drawForestCanopy: boolean;
  isInForest: boolean;
}

// 画面設定のインターフェース
export interface ScreenConfig {
  // 背景設定
  background: {
    drawSky: SkyType;
    drawGround: boolean;
    drawGrass: boolean;
    drawTrees: boolean;
    drawForestCanopy: boolean;
    isInForest: boolean;
  };
  // 障害物設定
  obstacles: string[];
  // ゲームクリア画面かどうか
  isGameClearScreen?: boolean;
}

// 統合された画面設定テーブル
export const screenConfigs: { [key: number]: ScreenConfig } = {
  1: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: false,
      isInForest: false
    },
    obstacles: ['Signboard']
  },
  2: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: false,
      isInForest: false
    },
    obstacles: ['Rock']
  },
  3: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: false,
      isInForest: false
    },
    obstacles: ['Pool']
  },
  4: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: false,
      isInForest: false
    },
    obstacles: ['Stump']
  },
  5: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: false,
      isInForest: false
    },
    obstacles: ['RollingRock']
  },
  6: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: true
    },
    obstacles: ['LotusLeaf', 'LargePool']
  },
  7: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: false
    },
    obstacles: ['Rock', 'RollingRock']
  },
  8: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: true
    },
    obstacles: ['ChestnutSpawner']
  },
  9: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: false
    },
    obstacles: ['Pool', 'RollingRock']
  },
  10: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: false
    },
    obstacles: ['BeeSpawner']
  },
  11: {
    background: {
      drawSky: SkyType.NORMAL,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: true
    },
    obstacles: ['Stump', 'ChestnutSpawner']
  },
  12: {
    background: {
      drawSky: SkyType.SUNSET,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: false
    },
    obstacles: ['Pool', 'FishSpawner']
  },
  13: {
    background: {
      drawSky: SkyType.SUNSET,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: true
    },
    obstacles: ['SpringSpawner']
  },
  14: {
    background: {
      drawSky: SkyType.SUNSET,
      drawGround: true,
      drawGrass: true,
      drawTrees: false,
      drawForestCanopy: false,
      isInForest: false
    },
    obstacles: ['Signboard']
  },
  15: {
    background: {
      drawSky: SkyType.NIGHT,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: false,
      isInForest: false
    },
    obstacles: ['LargePool', 'LotusLeaf', 'BeeSpawner']
  },
  16: {
    background: {
      drawSky: SkyType.NIGHT,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: true
    },
    obstacles: ['LargePool', 'TarzanRope']
  },
  17: {
    background: {
      drawSky: SkyType.NIGHT,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: true
    },
    obstacles: ['Pool', 'FishSpawner', 'ChestnutSpawner']
  },
  18: {
    background: {
      drawSky: SkyType.NIGHT,
      drawGround: true,
      drawGrass: true,
      drawTrees: false,
      drawForestCanopy: false,
      isInForest: false
    },
    obstacles: ['BouncingRockSpawner']
  },
  19: {
    background: {
      drawSky: SkyType.NIGHT,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: true
    },
    obstacles: ['LargePool', 'FountainSpawner']
  },
  20: {
    background: {
      drawSky: SkyType.NIGHT,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: true,
      isInForest: true
    },
    obstacles: ['SpringSpawner', 'BeeSpawner', 'LargePool']
  },
  21: {
    background: {
      drawSky: SkyType.NIGHT,
      drawGround: true,
      drawGrass: true,
      drawTrees: true,
      drawForestCanopy: false,
      isInForest: false
    },
    obstacles: ['Signboard'],
    isGameClearScreen: true
  }
}; 