export enum GameStatus {
    PLAYING = 'PLAYING',
    GAME_OVER = 'GAME_OVER',
    GAME_CLEAR = 'GAME_CLEAR',
    TRANSITIONING = 'TRANSITIONING'
}

export enum ScreenType {
    TITLE = 0,
    GAME = 1,
    GAME_OVER = 2,
    GAME_CLEAR = 3
}

export interface PlayerState {
    position: { x: number; y: number };
    velocityY: number;
    isGrounded: boolean;
    direction: number;
    isMoving: boolean;
    animationTime: number;
    lives: number;
}

export interface ScreenState {
    currentScreen: number;
    targetScreen: number;
    isTransitioning: boolean;
}

export interface ObstacleState {
    obstacleList: any[]; // 後で具体的な型に置き換え
}

export interface GameState {
    status: GameStatus;
    player: PlayerState;
    screen: ScreenState;
    obstacle: ObstacleState;
}

export type GameStateChangeEvent = {
    type: 'STATUS_CHANGE' | 'PLAYER_CHANGE' | 'SCREEN_CHANGE' | 'OBSTACLE_CHANGE';
    oldState: Partial<GameState>;
    newState: Partial<GameState>;
}; 