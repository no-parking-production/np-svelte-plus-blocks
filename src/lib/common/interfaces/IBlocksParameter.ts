import type {IBlocksParameterLite} from "./IBlocksParameterLite.ts";
import type {BlocksValueType} from "$lib/common/interfaces/blocks/ITypedParameter.js";

export interface IBlocksParameter extends IBlocksParameterLite {
    type: BlocksValueType;
    comment: string;
}