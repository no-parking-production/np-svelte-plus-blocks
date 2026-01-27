
interface SignalBindingAsync<S, T> {
    listener?: string;
    handler: (source: S, data: T) => Promise<void>;
}

interface IAsyncSignal<S,T> {
    bind(listener: string, handler: (source: S, data: T) => Promise<void>): void;
    unbind(listener: string): void;
}

export class AsyncSignal<S, T> implements IAsyncSignal<S,T> {
    private handlers: Array<SignalBindingAsync<S, T>> = [];
    // Duplicate the array to avoid side effects during iteration.
    private get handlersCopy(): Array<SignalBindingAsync<S, T>> {
        return this.handlers.slice(0);
    }
    public bind(
        listener: string,
        handler: (source: S, data: T) => Promise<void>,
    ): void {
        if (this.contains(listener)) {
            this.unbind(listener);
        }
        this.handlers.push({ listener, handler });
    }
    public unbind(listener: string): void {
        this.handlers = this.handlers.filter(h => h.listener !== listener);
    }
    public async trigger(source: S, data: T): Promise<void> {
        this.handlersCopy.map(h => h.handler(source, data));
    }
    public async triggerAwait(source: S, data: T): Promise<void> {
        // Duplicate the array to avoid side effects during iteration.
        const promises = this.handlersCopy.map(h => h.handler(source, data));
        await Promise.all(promises);
    }
    public contains(listener: string): boolean {
        return this.handlers.some(h => h.listener === listener);
    }
}