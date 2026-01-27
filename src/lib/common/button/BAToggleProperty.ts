import {ButtonAction} from "$lib/common/button/ButtonAction.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import {type Writable} from "svelte/store";
import {BlocksInterface} from "$lib/common/BlocksInterface.js";

export class BAToggleProperty extends ButtonAction {
    declare '@type': 'toggleProperty';
    public readonly propertyPath: string;
    public readonly onValue: BlocksParamType;
    public readonly offValue: BlocksParamType;
    private readonly property: Writable<BlocksParamType> | undefined;

    constructor(
        propertyPath: string,
        onValue: BlocksParamType,
        offValue: BlocksParamType
    ) {
        super();
        this.propertyPath = propertyPath;
        this.onValue = String(onValue);
        this.offValue = String(offValue);
        this.property = BlocksInterface.getInstance()?.getParamStore(propertyPath);
        this.property?.subscribe((value) => {
            this.setActive(value === this.onValue);
        });
    }
    onDown() {
        // nothing to do
    }
    onUp() {
        if (this.isActive) this.property?.set(this.offValue);
        else this.property?.set(this.onValue);
    }
}