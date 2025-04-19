export enum GameEvent {
    JUMP = 'jump',
    RESTART = 'restart',
    MOVE_LEFT = 'moveLeft',
    MOVE_RIGHT = 'moveRight',
    NEXT_SCREEN = 'next_screen',
    SCREEN_TRANSITION = 'screen_transition'
}

export class EventEmitter {
    private listeners: Map<GameEvent, Function[]> = new Map();

    on(event: GameEvent, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    emit(event: GameEvent, data?: any) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.forEach(callback => callback(data));
        }
    }
} 