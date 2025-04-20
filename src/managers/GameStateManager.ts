import { EventEmitter, GameEvent } from '../utils/EventEmitter';
import { GameState, GameStatus, GameStateChangeEvent, PlayerState, ScreenState, ObstacleState } from '../types/GameState';

export class GameStateManager {
    private state: GameState;
    private eventEmitter: EventEmitter;

    constructor() {
        this.eventEmitter = new EventEmitter();
        this.state = this.createInitialState();
    }

    private createInitialState(): GameState {
        return {
            status: GameStatus.PLAYING,
            player: {
                position: { x: 0, y: 0 },
                velocityY: 0,
                isGrounded: false,
                direction: 1,
                isMoving: false,
                animationTime: 0,
                lives: 3
            },
            screen: {
                currentScreen: 1,
                targetScreen: 1,
                isTransitioning: false
            },
            obstacle: {
                obstacleList: []
            }
        };
    }

    public getState(): GameState {
        return {
            status: this.state.status,
            player: { ...this.state.player },
            screen: { ...this.state.screen },
            obstacle: {
                obstacleList: [...this.state.obstacle.obstacleList]
            }
        };
    }

    public setState(newState: Partial<GameState>): void {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        const event: GameStateChangeEvent = {
            type: this.determineChangeType(oldState, newState),
            oldState,
            newState
        };
        
        this.eventEmitter.emit(GameEvent.STATE_CHANGE, event);
    }

    private determineChangeType(oldState: GameState, newState: Partial<GameState>): GameStateChangeEvent['type'] {
        if (newState.status !== undefined && oldState.status !== newState.status) {
            return 'STATUS_CHANGE';
        }
        if (newState.player !== undefined && JSON.stringify(oldState.player) !== JSON.stringify(newState.player)) {
            return 'PLAYER_CHANGE';
        }
        if (newState.screen !== undefined && JSON.stringify(oldState.screen) !== JSON.stringify(newState.screen)) {
            return 'SCREEN_CHANGE';
        }
        if (newState.obstacle !== undefined && JSON.stringify(oldState.obstacle) !== JSON.stringify(newState.obstacle)) {
            return 'OBSTACLE_CHANGE';
        }
        return 'STATUS_CHANGE'; // デフォルト
    }

    // 状態の個別のgetter/setter
    public getStatus(): GameStatus {
        return this.state.status;
    }

    public setStatus(status: GameStatus): void {
        this.setState({ status });
    }

    public getPlayerState(): PlayerState {
        return { ...this.state.player };
    }

    public setPlayerState(playerState: Partial<PlayerState>): void {
        this.setState({
            player: { ...this.state.player, ...playerState }
        });
    }

    public getScreenState(): ScreenState {
        return { ...this.state.screen };
    }

    public setScreenState(screenState: Partial<ScreenState>): void {
        this.setState({
            screen: { ...this.state.screen, ...screenState }
        });
    }

    public getObstacleState(): ObstacleState {
        return { ...this.state.obstacle };
    }

    public setObstacleState(obstacleState: Partial<ObstacleState>): void {
        this.setState({
            obstacle: { ...this.state.obstacle, ...obstacleState }
        });
    }

    // イベントリスナーの管理
    public onStateChange(callback: (event: GameStateChangeEvent) => void): void {
        this.eventEmitter.on(GameEvent.STATE_CHANGE, callback);
    }

    public offStateChange(callback: (event: GameStateChangeEvent) => void): void {
        this.eventEmitter.off(GameEvent.STATE_CHANGE, callback);
    }

    // 画面遷移状態の管理
    public startScreenTransition(targetScreen: number): void {
        const state = this.getState();
        state.screen.isTransitioning = true;
        state.screen.targetScreen = targetScreen;
        this.setState(state);
    }

    public endScreenTransition(): void {
        const state = this.getState();
        state.screen.isTransitioning = false;
        state.screen.currentScreen = state.screen.targetScreen;
        this.setState(state);
    }

    public isScreenTransitioning(): boolean {
        return this.getState().screen.isTransitioning;
    }
} 