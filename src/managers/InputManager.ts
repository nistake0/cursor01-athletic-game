import { EventEmitter, GameEvent } from '../utils/EventEmitter';

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

    constructor(eventEmitter: EventEmitter) {
        this.eventEmitter = eventEmitter;
        this.initializeKeyStates();
        this.setupActionMapping();
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
        window.addEventListener('keydown', (e) => {
            const keyCode = e.key as KeyCode;
            if (this.keyStates.has(keyCode)) {
                this.keyStates.get(keyCode)!.setPressed(true);
                
                // アクションに基づいてイベントを発火
                this.triggerActionEvents(keyCode);
            }
        });

        window.addEventListener('keyup', (e) => {
            const keyCode = e.key as KeyCode;
            if (this.keyStates.has(keyCode)) {
                this.keyStates.get(keyCode)!.setPressed(false);
            }
        });
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

    // 毎フレーム呼び出して、キーの状態を更新
    update(): void {
        this.keyStates.forEach(state => state.update());
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
} 