export type EventHandler<T> = (value: T) => void;
export class EventSubscription<T> {

    private readonly _listeners: EventHandler<T>[] = [];

    public subscribe(onEvent: EventHandler<T>): void {
        this._listeners.push(onEvent);
    }
    public unsubscribe(onEvent: EventHandler<T>): void {
        const index = this._listeners.indexOf(onEvent);
        if (index > -1) this._listeners.splice(index, 1);
    }
    public emit(value: T) {
        for (let i = 0; i < this._listeners.length; i++) {
            this._listeners[i](value);
        }
    }
}