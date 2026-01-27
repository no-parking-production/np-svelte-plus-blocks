import type {IBlocksToAppInterface} from "$lib/common/interfaces/IBlocksToAppInterface.js";
import type {BlocksParamType} from "$lib/common/interfaces/BlocksApi.js";

export interface IAppToBlocksInterface {
    connect(btaInterface: IBlocksToAppInterface): void;


    loadShow(blockPath: string, soft: boolean): void;

    action(): void;

    gotoBlock(path: string): void;
    goBack(): void;


    setLocation(location: string): void;
    setTags(tags: string): void;
    setTagsOfSet(tagList: string, tagSet: string): void;
    toggleTags(tags: string): void;
    addTags(tags: string): void;
    removeTags(tags: string): void;
    setLocalParam(name: string, value: BlocksParamType): void;

    subscribeServerParam(path: string): void;
    setServerParam(path: string, value: string): void;
}