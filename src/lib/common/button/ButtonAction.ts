import {writable, type Writable} from 'svelte/store';
import {BlocksInterface} from "$lib/common/BlocksInterface.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import type {BlocksValueType} from "$lib/common/interfaces/blocks/ITypedParameter.js";

export abstract class ButtonAction {
    '@type': string;
    public readonly active: Writable<boolean> = writable(false);
    abstract onDown(): void;
    abstract onUp(): void;

    private _isActive: boolean = false;
    protected get isActive(): boolean { return this._isActive; }
    protected blocksInterface: BlocksInterface | null;

    protected constructor() {
        this.blocksInterface = BlocksInterface.getInstance();
    }

    protected setActive(isActive: boolean) {
        if (isActive === this._isActive) return;
        this._isActive = isActive;
        this.active.set(isActive);
    }
}
export abstract class ButtonActionWithParam extends ButtonAction {
    protected readonly propertyPath: string;
    protected readonly property: Writable<BlocksParamType> | undefined;
    protected readonly valueType: BlocksValueType | undefined;
    private _currentValue: BlocksParamType | undefined;
    protected get currentValue(): BlocksParamType | undefined { return this._currentValue; }
    protected constructor(propertyPath: string) {
        super();
        this.propertyPath = propertyPath;
        this.property = this.blocksInterface?.getParamStore(propertyPath);
        this.valueType = this.blocksInterface?.getParamValueType(propertyPath);
        this.property?.subscribe((value) => {
            this._currentValue = value;
            this.onValueChange(value);
        });
        this._currentValue = this.blocksInterface?.getParamValue(propertyPath);
    }
    protected abstract onValueChange(value: BlocksParamType): void;
}


