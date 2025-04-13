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