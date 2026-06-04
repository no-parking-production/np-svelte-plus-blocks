import {
    GenericPropertyManager,
    type parameterHandler,
    type parameterHandlerLite
} from "$lib/common/blocks_interface/GenericPropertyManager.js";
import type {BlocksParamPath, BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import type {IBlocksPubSubManager} from "$lib/common/blocks_interface/interfaces/IBlocksPubSubManager.js";
import {
    type IPubSubData, PubSubData,
} from "$lib/common/blocks_interface/interfaces/PubSubTypes.js";
import {BlocksValueType} from "$lib/common/interfaces/blocks/ITypedParameter.js";
import {localCache} from "$lib/common/blocks_interface/no_origin/cache.js";

export class BlocksPubSubManagerBrowser implements IBlocksPubSubManager {
    private localCache = localCache;

    private readonly genericPropertyManager: GenericPropertyManager;

    constructor(
        onParamChange: parameterHandlerLite,
        onParamDiscovery: parameterHandler
    ) {
        this.genericPropertyManager = new GenericPropertyManager(onParamChange, onParamDiscovery);
    }

    public subscribe(path: BlocksParamPath): void {
        const paramStore = this.localCache?.getStore(path);
        if (paramStore) {
            paramStore.subscribe((value: BlocksParamType) => this.genericPropertyManager.dataReceived(value, path));
        }
    }

    public setValue(path: BlocksParamPath, value: BlocksParamType): void {
        const type = this.genericPropertyManager.getParameterType(path);
        switch (type) {
            case BlocksValueType.Boolean:
                this.sendChange(new PubSubData(path, this.isTruthy(value)));
                break;
            case BlocksValueType.Number:
                this.sendChange(new PubSubData(path, +value));
                break;
            default:
                this.sendChange(new PubSubData(path, value));
                break;
        }
    }
    private isTruthy(value: string | number | boolean): boolean {
        return !(value == undefined || value == false || value == 0 || value == '0' || value == '' || value.toString().toLowerCase() == 'false');
    }
    private sendChange(change: IPubSubData): void {
        this.localCache?.set(change.path, change.value);
    }

}