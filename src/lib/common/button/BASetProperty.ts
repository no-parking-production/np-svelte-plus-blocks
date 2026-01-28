import {ButtonActionWithParam} from "$lib/common/button/ButtonAction.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import {BlocksHelper} from "$lib/common/blocks_interface/BlocksHelper.js";

export class BASetProperty extends ButtonActionWithParam {
    declare '@type': 'setProperty';
    private readonly value: BlocksParamType;
    constructor(
        propertyPath: string,
        setValue: BlocksParamType
    ) {
        super(propertyPath);
        this.value = BlocksHelper.fixValue(setValue, this.valueType);
        this.setActive(this.value === this.currentValue);
    }


    onDown() {
        // nothing to do
    }
    onUp() {
        this.property?.set(this.value);
    }
    protected onValueChange(value: BlocksParamType): void {
        this.setActive(value === this.value);
    }
}