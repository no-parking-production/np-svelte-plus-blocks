import type {IBlocksParameterLite} from "./IBlocksParameterLite.ts";
import {BlocksValueType} from "./BlocksApi.ts";

export interface IBlocksParameter extends IBlocksParameterLite {
    type: BlocksValueType;
    comment: string;
}