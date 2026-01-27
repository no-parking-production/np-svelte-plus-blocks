import {writable, type Writable} from 'svelte/store';

export abstract class ButtonAction {
    '@type': string;
    public readonly active: Writable<boolean> = writable(false);
    abstract onDown(): void;
    abstract onUp(): void;

    private _isActive: boolean = false;
    protected get isActive(): boolean { return this._isActive; }

    protected setActive(isActive: boolean) {
        if (isActive === this._isActive) return;
        this._isActive = isActive;
        this.active.set(isActive);
    }
}


