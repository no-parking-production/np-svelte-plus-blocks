import {writable, type Writable} from 'svelte/store';
import type {IBlocksParameter} from "$lib/common/interfaces/IBlocksParameter.js";
import type {IBlocksParameterLite} from "$lib/common/interfaces/IBlocksParameterLite.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import type {IBlocksWindow} from "$lib/common/interfaces/BlocksApi.js";
import {BlocksPubSubManager} from "$lib/common/blocks_interface/same_origin/BlocksPubSubManager.js";
import {BlocksPropertyManager} from "$lib/common/blocks_interface/same_origin/BlocksPropertyManager.js";
import {BlocksTagManager} from "$lib/common/blocks_interface/same_origin/BlocksTagManager.js";
import {ScannerGroup} from "$lib/common/blocks_interface/same_origin/ScannerGroup.js";
import type {BlocksValueType} from "$lib/common/interfaces/blocks/ITypedParameter.js";
import {BlocksHelper} from "$lib/common/blocks_interface/BlocksHelper.js";
import type {IBlocksPubSubManager} from "$lib/common/blocks_interface/interfaces/IBlocksPubSubManager.js";
import {BlocksPubSubManagerOther} from "$lib/common/blocks_interface/other_origin/BlocksPubSubManagerOther.js";
import {TagSet} from "$lib/common/TagSet.js";
import {EventSubscription} from "$lib/common/events/EventSubscription.js";
import {BlocksPubSubManagerNoWindow} from "$lib/common/blocks_interface/no_origin/BlocksPubSubManagerNoWindow.js";

const PREFIX_LOCAL_PARAM = 'Local.parameter.';
const POSTFIX_VALUE = '.value';

const TO_ARRAY = (value: string): string[] => value.split(',').map(s => s.trim());

export class BlocksInterface {
    private _paramStores: Map<string, Writable<BlocksParamType>> = new Map();
    private _paramValues: Map<string, BlocksParamType> = new Map();
    private _paramTypes: Map<string, BlocksValueType> = new Map();

    public readonly tagSet: Writable<TagSet> = writable<TagSet>(new TagSet());
    public readonly onGotoBlock: EventSubscription<string> = new EventSubscription<string>();

    private static _blocksWindow: IBlocksWindow | null = null;
    private static _instance: BlocksInterface | null = null;

    private readonly _pubSubManager: IBlocksPubSubManager | undefined;
    private readonly _propManager: BlocksPropertyManager | undefined;
    private readonly _blocksTagManager: BlocksTagManager | undefined;
    private readonly _scannerGroup: ScannerGroup | undefined;

    private readonly _isSameOrigin: boolean;
    /**
     * Indicates if the BlocksInterface is embedded within another window.
     */
    private readonly _isEmbedded: boolean;
    private readonly _isNotBrowser: boolean;

    private readonly _warnOnceGoto = WarnOnce.create('gotoBlock not supported for standalone mode');
    private readonly _warnOnceSetLocation = WarnOnce.create('setLocation not supported for standalone mode');
    private readonly _warnOnceGoBack = WarnOnce.create('goBack not supported for standalone mode');

    public static getInstance(): BlocksInterface {
        if (BlocksInterface._instance) return BlocksInterface._instance;
        BlocksInterface._instance = new BlocksInterface();
        return BlocksInterface._instance;
    }

    private constructor() {
        this.onUpdateParam = this.onUpdateParam.bind(this);
        this.onRegisterParam = this.onRegisterParam.bind(this);

        this.onAddTags = this.onAddTags.bind(this);
        this.onRemoveTags = this.onRemoveTags.bind(this);

        this._isNotBrowser = typeof window === 'undefined';
        if (this._isNotBrowser) {
            console.warn('BlocksInterface: running outside of browser');
            this._isEmbedded = false;
            this._isSameOrigin = false;
            this._pubSubManager = new BlocksPubSubManagerNoWindow(undefined, this.onUpdateParam, this.onRegisterParam);
            return;
        }

        BlocksInterface._blocksWindow = window?.top as unknown as IBlocksWindow;
        let sameOrigin = true;

        this._isEmbedded = window?.top !== window;

        // Check if blocksWindow is served from same origin
        if (window?.top && this._isEmbedded) {
            try {
                // Try to access top window's origin - will throw if cross-origin
                const topOrigin = window.top.location.origin;
                if (topOrigin !== window.location.origin) {
                    console.warn('BlocksInterface: blocksWindow is from different origin');
                    sameOrigin = false;
                }
            } catch (e) {
                // Cross-origin access blocked by browser
                console.warn('BlocksInterface: Cannot access blocksWindow origin (cross-origin)');
                sameOrigin = false;
            }
        }
        this._isSameOrigin = sameOrigin;

        if (!this._isEmbedded) {
            // todo: connect to Blocks via UserScript for setting attribute values
            console.log('not embedded - maybe use a user script to set attribute values?');
            return;
        }

        if (!sameOrigin) {
            this._pubSubManager = new BlocksPubSubManagerOther(BlocksInterface._blocksWindow, this.onUpdateParam, this.onRegisterParam);
        } else {
            this._pubSubManager = new BlocksPubSubManager(BlocksInterface._blocksWindow, this.onUpdateParam, this.onRegisterParam);
            this._propManager = new BlocksPropertyManager(BlocksInterface._blocksWindow, this.onUpdateParam, this.onRegisterParam);
            this._blocksTagManager = new BlocksTagManager(
                BlocksInterface._blocksWindow,
                this.onUpdateTags,
                this.onAddTags,
                this.onRemoveTags
            );
            this._scannerGroup = new ScannerGroup(BlocksInterface._blocksWindow, [this._blocksTagManager, this._propManager]);
            this._scannerGroup.startScanning();
        }
    }

    /**
     * Get or create a Svelte store for a parameter path with bidirectional sync
     * @param path - The parameter path
     * @returns A Svelte writable store
     */
    public getParamStore(path: string): Writable<BlocksParamType> {
        path = BlocksInterface.fixPath(path);

        if (this._paramStores.has(path)) {
            return this._paramStores.get(path) as Writable<BlocksParamType>;
        }

        const isLocal = BlocksInterface.isLocalParam(path);

        // Subscribe to server param if not already subscribed
        if (!isLocal) this.subscribeServerParam(path);
        if (isLocal && !this._isSameOrigin) this.subscribeServerParam(path);

        // Create a new store with an initial value
        const initialValue = this._paramValues.get(path);
        const store = writable<BlocksParamType>(initialValue);

        // Subscribe to store changes and update server param
        store.subscribe((value: BlocksParamType | undefined) => {
            const currentValue = this._paramValues.get(path);

            // Only update if value actually changed to avoid loops
            if (value !== currentValue && value !== undefined) {
                this._paramValues.set(path, value);
                if (isLocal) {
                    const localPath = path.substring(PREFIX_LOCAL_PARAM.length);
                    this.setLocalParam(localPath, value);
                }
                else this.setServerParam(path, value);
            }
        });

        this._paramStores.set(path, store);
        return store;
    }
    public getParamValueType(path: string): BlocksValueType | undefined {
        path = BlocksInterface.fixPath(path);
        return this._paramTypes.get(path);
    }
    public getParamValue(path: string): BlocksParamType | undefined {
        path = BlocksInterface.fixPath(path);
        return this._paramValues.get(path);
    }

    /**
     * Called when a parameter value changes from the server
     * Updates the corresponding store
     */
    private onParamUpdate(paramLite: IBlocksParameterLite, type: BlocksValueType | null = null): void {
        let value = paramLite.value;
        if (type) {
            this._paramTypes.set(paramLite.name, type);
            value = BlocksHelper.fixValue(value, type);
        }
        this._paramValues.set(paramLite.name, value);

        const store = this._paramStores.get(paramLite.name);
        store?.set(value);
    }

    /**
     * Remove a parameter store subscription
     */
    private unsubscribeParam(path: string): void {
        this._paramStores.delete(path);
        this._paramValues.delete(path);
        this._paramTypes.delete(path);
    }

    /**
     * Clear all parameter stores
     */
    private clearAll(): void {
        this._paramStores.clear();
        this._paramValues.clear();
        this._paramTypes.clear();
    }

    private setLocalParam(name: string, value: BlocksParamType): void {
        if (!this._isEmbedded) return;
        if (this._isSameOrigin) {
            BlocksInterface._blocksWindow?.pixiAPI.propProvider.setLocal(name, value);
        } else {
            this._pubSubManager?.setValue(PREFIX_LOCAL_PARAM + name, value);
        }
    }
    private subscribeServerParam(path: string): void {
        this._pubSubManager?.subscribe(path);
    }
    private setServerParam(path: string, value: BlocksParamType): void {
        this._pubSubManager?.setValue(path, value);
    }


    // svelte -> blocks
    // https://pixilab.se/docs/blocks/api/javascript#additional_web_block_interaction_capabilities
    /**
     * https://pixilab.se/docs/blocks/api/javascript#action
     * "Keeps any enclosing Attractor Block in its active state."
     */
    public action(): void {
        if (this._isEmbedded) BlocksInterface.postBlocksMessage('action');
        else console.warn('action not supported for standalone mode');
    }

    /**
     * "Navigate to a specified block path inside the current root block."
     * @param path
     */
    public gotoBlock(path: string): void {
        if (this._isEmbedded) BlocksInterface.postBlocksMessage('goto-block', path);
        else this._warnOnceGoto();
        this.onGotoBlock.emit(path);
    }

    /**
     * "Navigate back, just like the browser's BACK button."
     */
    public goBack(): void {
        if (this._isEmbedded) BlocksInterface.postBlocksMessage('go-back');
        else {
            window?.history.back();
            this._warnOnceGoBack();
        }
    }

    /**
     * "Tells any enclosing Locator block to locate the Spot path or Location ID specified."
     * @param location will be interpreted as a Location ID if numeric, otherwise as Spot path
     */
    public setLocation(location: string): void {
        if (this._isEmbedded) BlocksInterface.postBlocksMessage('set-location', location);
        else this._warnOnceSetLocation();
    }
    public setTags(tags: string): void {
        this._blocksTagManager?.setTags(tags);
        this.tagSet.update(() => {
            return TagSet.fresh(tags);
        });
    }
    public setTagsOfSet(tagList: string, tagSet: string): void {
        this._blocksTagManager?.setTagsOfSet(tagList, tagSet);
        this.tagSet.update((currentSet): TagSet => {
            const wantedTags = TagSet.fresh(tagList);
            const unwantedTags = (TagSet.fresh(tagSet)).difference(wantedTags);
            return currentSet.difference(unwantedTags).union(wantedTags) as TagSet;
        });
    }
    public toggleTags(tags: string): void {
        this._blocksTagManager?.toggleTags(tags);
        this.tagSet.update((tagSet): TagSet => {
            const incomingTags = TagSet.fresh(tags);
            const contained = incomingTags.intersection(tagSet);
            const missing = incomingTags.difference(tagSet);
            return tagSet.difference(contained).union(missing) as TagSet;
        });
    }
    public addTags(tags: string): void {
        this._blocksTagManager?.addTags(tags);
        this.internalAddTags(tags);
    }
    public removeTags(tags: string): void {
        this._blocksTagManager?.removeTags(tags);
        this.internalRemoveTags(tags);
    }


    // blocks -> svelte

    private onAddTags(tags: string): void {
        this.internalAddTags(tags);
    }
    private onRemoveTags(tags: string): void {
        this.internalRemoveTags(tags);
    }
    private onUpdateTags(tags: string): void {
        console.log('updateTags', tags);
    }

    private onShowLoaded(show: string): void {
    }

    private onRegisterParam(parameter: IBlocksParameter): void {
        // console.log('registerParam', parameter);
        this.onParamUpdate(parameter, parameter.type);
    }



    private onUpdateParam(parameter: IBlocksParameterLite): void {
        this.onParamUpdate(parameter);
    }

    private updatePath(path: string): void {
    }

    private updateShow(show: string): void {
    }



    // internal
    private internalAddTags(tags: string): void {
        this.tagSet.update((tagSet): TagSet => {
            return tagSet.union(TagSet.fresh(tags)) as TagSet;
        });
    }
    private internalRemoveTags(tags: string): void {
        this.tagSet.update((tagSet): TagSet => {
            return tagSet.difference(TagSet.fresh(tags)) as TagSet;
        });
    }

    // misc tooling
    private static toArray(value: string): string[] {
        return value.split(',').map(s => s.trim());
    }
    private static postBlocksMessage(type: string, data: string | null = null): void {
        if (data) BlocksInterface.postMessage({type: type, data: data});
        else BlocksInterface.postMessage({type: type});
    }
    private static postMessage(message: any): void {
        BlocksInterface._blocksWindow?.postMessage(message, '*');
    }
    private static regexRealmVariableWithoutPostfix = /^Realm\.[^.]+\.variable\.[^.]+$/;
    private static fixPath(path: string): string {
        if (path.indexOf('.') === -1) {
            return PREFIX_LOCAL_PARAM + path;
        }
        if (path.startsWith(PREFIX_LOCAL_PARAM)) return path;
        if (BlocksInterface.regexRealmVariableWithoutPostfix.test(path)) return path + POSTFIX_VALUE;
        return path;

    }
    private static isLocalParam(path: string): boolean {
        return path.startsWith(PREFIX_LOCAL_PARAM);
    }
}

class WarnOnce{
    private warned = false;
    constructor(private msg: string) {
        this.warn.bind(this);
    }
    warn(): void {
        if (!this.warned) {
            console.warn('[Only warning once]: ' + this.msg);
            this.warned = true;
        }
    }
    public static create(msg: string): () => void {
        const warnOnce = new WarnOnce(msg);
        return warnOnce.warn.bind(warnOnce);
    }
}
