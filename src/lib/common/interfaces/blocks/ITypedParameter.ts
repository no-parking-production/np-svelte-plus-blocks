import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";

export enum BlocksValueType {
    Auto = 0,
    String = 1,
    Number = 2,
    Boolean = 3,
}
export interface ITypedParameter {
    comment: string,
    name: string,
    type: BlocksValueType,
    value: BlocksParamType,
}