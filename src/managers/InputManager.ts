import { EventEmitter, GameEvent } from '../utils/EventEmitter';
import { Game } from '../game';

// キーコードを定数として定義
export enum KeyCode {
    // 矢印キー
    LEFT = 'ArrowLeft',
    RIGHT = 'ArrowRight',
    UP = 'ArrowUp',
    DOWN = 'ArrowDown',
    
    // WASDキー
    A = 'a',
    D = 'd',
    W = 'w',
    S = 's',
    
    // その他のキー
    SPACE = ' ',
    ESC = 'Escape',
    DIGIT_1 = '1'
}

// アクションの種類を定義
export enum ActionType {
    MOVE_LEFT,
    MOVE_RIGHT,
    JUMP,
    RESTART,
    NEXT_SCREEN
}

// キーの状態を管理するクラス
class KeyState {
    private pressed: boolean = false;
    private justPressed: boolean = false;
    private justReleased: boolean = false;

    setPressed(pressed: boolean): void {
        if (pressed && !this.pressed) {
            this.justPressed = true;
        } else if (!pressed && this.pressed) {
            this.justReleased = true;
        }
        this.pressed = pressed;
    }

    update(): void {
        this.justPressed = false;
        this.justReleased = false;
    }

    isPressed(): boolean {
        return this.pressed;
    }

    wasJustPressed(): boolean {
        return this.justPressed;
    }

    wasJustReleased(): boolean {
        return this.justReleased;
    }
}

export class InputManager {
    private eventEmitter: EventEmitter;
    private keyStates: Map<KeyCode, KeyState> = new Map();
    private actionToKeyMap: Map<ActionType, KeyCode[]> = new Map();
    private isInputEnabled: boolean = true;  // 操作可能かどうかのフラグ
    private isAutoJumping: boolean = false;  // 自動ジャンプ中かどうかのフラグ
    private game: Game;  // Gameインスタンスを保持
    private keyDownHandler: (e: KeyboardEvent) => void;
    private keyUpHandler: (e: KeyboardEvent) => void;

    constructor(eventEmitter: EventEmitter, game: Game) {
        this.eventEmitter = eventEmitter;
        this.game = game;
        this.initializeKeyStates();
        this.setupActionMapping();
        
        // イベントハンドラーをクラスプロパティとして保存
        this.keyDownHandler = (e) => {
            const keyCode = e.key as KeyCode;
            if (this.keyStates.has(keyCode)) {
                this.keyStates.get(keyCode)!.setPressed(true);
                this.triggerActionEvents(keyCode);
            }
        };
        
        this.keyUpHandler = (e) => {
            const keyCode = e.key as KeyCode;
            if (this.keyStates.has(keyCode)) {
                this.keyStates.get(keyCode)!.setPressed(false);
            }
        };
        
        this.setupKeyboardInput();
    }

    private initializeKeyStates(): void {
        // 監視するキーの初期化
        Object.values(KeyCode).forEach(keyCode => {
            this.keyStates.set(keyCode as KeyCode, new KeyState());
        });
    }

    private setupActionMapping(): void {
        // アクションとキーのマッピングを設定
        this.actionToKeyMap.set(ActionType.MOVE_LEFT, [KeyCode.LEFT, KeyCode.A]);
        this.actionToKeyMap.set(ActionType.MOVE_RIGHT, [KeyCode.RIGHT, KeyCode.D]);
        this.actionToKeyMap.set(ActionType.JUMP, [KeyCode.UP, KeyCode.W, KeyCode.SPACE]);
        this.actionToKeyMap.set(ActionType.RESTART, [KeyCode.SPACE]);
        this.actionToKeyMap.set(ActionType.NEXT_SCREEN, [KeyCode.ESC, KeyCode.DIGIT_1]);
    }

    private setupKeyboardInput(): void {
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
    }

    private triggerActionEvents(keyCode: KeyCode): void {
        // 各アクションに対して、押されたキーがマッピングされているか確認
        this.actionToKeyMap.forEach((keys, action) => {
            if (keys.includes(keyCode)) {
                switch (action) {
                    case ActionType.JUMP:
                        this.eventEmitter.emit(GameEvent.JUMP);
                        break;
                    case ActionType.RESTART:
                        this.eventEmitter.emit(GameEvent.RESTART);
                        break;
                    case ActionType.NEXT_SCREEN:
                        // キーに応じて画面遷移量を設定
                        const transitionAmount = keyCode === KeyCode.ESC ? 5 : 1;
                        this.eventEmitter.emit(GameEvent.SCREEN_TRANSITION, transitionAmount);
                        break;
                }
            }
        });
    }

    public setInputEnabled(enabled: boolean): void {
        this.isInputEnabled = enabled;
    }

    public setAutoJumping(enabled: boolean): void {
        this.isAutoJumping = enabled;
    }

    public update(): void {
        const keyboard = this.game.getApp().renderer.plugins.interaction.keyboard;
        if (keyboard) {
            // スペースキーの入力を監視
            if (keyboard.isKeyDown('Space')) {
                this.eventEmitter.emit(GameEvent.SPACE_KEY_PRESSED);
            }

            // 左右の移動
            if (keyboard.isKeyDown('ArrowLeft')) {
                this.eventEmitter.emit(GameEvent.MOVE_LEFT);
            } else if (keyboard.isKeyDown('ArrowRight')) {
                this.eventEmitter.emit(GameEvent.MOVE_RIGHT);
            }
        }

        // キーの状態を更新
        this.keyStates.forEach(state => state.update());

        if (!this.isInputEnabled) {
            // 操作不能時は自動ジャンプのみ処理
            if (this.isAutoJumping && this.game.getPlayerManager().isGroundedState()) {
                this.eventEmitter.emit(GameEvent.JUMP);
            }
            return;
        }

        // 通常の入力処理
        if (this.isActionActive(ActionType.MOVE_LEFT)) {
            this.eventEmitter.emit(GameEvent.MOVE_LEFT);
        }
        if (this.isActionActive(ActionType.MOVE_RIGHT)) {
            this.eventEmitter.emit(GameEvent.MOVE_RIGHT);
        }
        if (this.isActionActive(ActionType.JUMP)) {
            this.eventEmitter.emit(GameEvent.JUMP);
        }
        if (this.isActionActive(ActionType.RESTART)) {
            this.eventEmitter.emit(GameEvent.RESTART);
        }
    }

    // 特定のアクションが実行されているかどうかを確認
    isActionActive(actionType: ActionType): boolean {
        const keys = this.actionToKeyMap.get(actionType);
        if (!keys) return false;
        
        return keys.some(key => this.isKeyPressed(key));
    }

    // キーが押されているかどうかを確認
    isKeyPressed(keyCode: KeyCode): boolean {
        return this.keyStates.get(keyCode)?.isPressed() || false;
    }

    // キーが今フレームで押されたかどうかを確認
    wasKeyJustPressed(keyCode: KeyCode): boolean {
        return this.keyStates.get(keyCode)?.wasJustPressed() || false;
    }

    // キーが今フレームで離されたかどうかを確認
    wasKeyJustReleased(keyCode: KeyCode): boolean {
        return this.keyStates.get(keyCode)?.wasJustReleased() || false;
    }

    public destroy(): void {
        // キーボードイベントリスナーを解除
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
    }
} 