import {ButtonAction} from "$lib/common/button/ButtonAction.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import {type Writable} from "svelte/store";
import {BlocksInterface} from "$lib/common/BlocksInterface.js";

export class BASetProperty extends ButtonAction {
    declare '@type': 'setProperty';
    public readonly propertyPath: string;
    public readonly value: BlocksParamType;
    private readonly property: Writable<BlocksParamType> | undefined;

    constructor(
        propertyPath: string,
        value: BlocksParamType
    ) {
        super();
        this.propertyPath = propertyPath;
        this.value = value;
        this.property = BlocksInterface.getInstance()?.getParamStore(propertyPath);
        this.property?.subscribe((value) => {
            console.log('BASetProperty', value);
            this.setActive(value === this.value);
        });
    }
    onDown() {
        // nothing to do
    }
    onUp() {
        this.property?.set(this.value);
    }
}