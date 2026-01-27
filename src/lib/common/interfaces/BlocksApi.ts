import type {ISpotInfo} from "$lib/common/interfaces/blocks/ISpotInfo.js";
import type {ITagSet} from "$lib/common/interfaces/blocks/ITagSet.js";
import type {IBlocksPropertyProvider} from "$lib/common/interfaces/blocks/IBlocksPropertyProvider.js";
import type {IPlayerPubSub} from "$lib/common/interfaces/blocks/IPlayerPubSub.js";

export interface IBlocksWindow extends Window {
    pixiAPI: IBlocksAPI;
    GPixiVersion: string;
}
export interface IBlocksAPI {
    appliedTags: ITagSet;
    /** fixed tags */
    configuredTags: ITagSet;
    /** tags set through Tasks, Buttons, ... */
    localTags: ITagSet;
    tagSet: ITagSet;

    loadShow(blockPath: string, soft: boolean): Promise<void>;
    locateSpot(location: string, isSpotPath?: boolean): void;
    propProvider: IBlocksPropertyProvider;
    pubSub: IPlayerPubSub;
    showName: string;

    spotInfo: ISpotInfo;
}





