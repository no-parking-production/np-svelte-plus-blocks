import {ButtonActionWithParam} from "$lib/common/button/ButtonAction.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import {BlocksHelper} from "$lib/common/blocks_interface/BlocksHelper.js";

export class BAToggleProperty extends ButtonActionWithParam {
    declare '@type': 'toggleProperty';
    public readonly onValue: BlocksParamType;
    public readonly offValue: BlocksParamType;

    constructor(
        propertyPath: string,
        onValue: BlocksParamType,
        offValue: BlocksParamType
    ) {
        super(propertyPath);
        this.onValue = BlocksHelper.fixValue(onValue, this.valueType);
        this.offValue = BlocksHelper.fixValue(offValue, this.valueType);
        this.setActive(this.currentValue === this.onValue);
    }
    onDown() {
        // nothing to do
    }
    onUp() {
        if (this.isActive) this.property?.set(this.offValue);
        else this.property?.set(this.onValue);
    }
    protected onValueChange(value: BlocksParamType): void {
        this.setActive(value === this.onValue);
    }
}