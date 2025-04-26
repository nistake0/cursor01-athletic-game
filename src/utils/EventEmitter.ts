export enum GameEvent {
    JUMP = 'jump',
    RESTART = 'restart',
    MOVE_LEFT = 'moveLeft',
    MOVE_RIGHT = 'moveRight',
    NEXT_SCREEN = 'next_screen',
    SCREEN_TRANSITION = 'screen_transition',
    STATE_CHANGE = 'state_change',
    SPACE_KEY_PRESSED = 'space_key_pressed'
}

export class EventEmitter {
    private listeners: Map<GameEvent, Function[]> = new Map();

    on(event: GameEvent, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    off(event: GameEvent, callback: Function) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event)!;
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event: GameEvent, data?: any) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.forEach(callback => callback(data));
        }
    }
} 