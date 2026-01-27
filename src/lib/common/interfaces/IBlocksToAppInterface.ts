import type {IBlocksParameter} from "./IBlocksParameter.ts";
import type {IBlocksParameterLite} from "./IBlocksParameterLite.ts";

export interface IBlocksToAppInterface {
    onShowLoaded(show: string): void;

    registerParam(parameter: IBlocksParameter): void;
    updateParam(parameter: IBlocksParameterLite): void;

    updatePath(path: string): void;
    updateShow(show: string): void;

    updateTags(tags: string): void;
    addTags(tags: string): void;
    removeTags(tags: string): void;
}