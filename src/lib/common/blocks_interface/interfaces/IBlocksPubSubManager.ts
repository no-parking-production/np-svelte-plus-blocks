import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";

export interface IBlocksPubSubManager {
    subscribe(path: string): void;
    setValue(path: string, value: BlocksParamType): void
}
