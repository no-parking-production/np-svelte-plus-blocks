import { writable, type Writable } from 'svelte/store';
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

const PREFIX_LOCAL_PARAM = 'Local.parameter.';
const POSTFIX_VALUE = '.value';

export class BlocksInterface {
    private paramStores: Map<string, Writable<BlocksParamType>> = new Map();
    private paramValues: Map<string, BlocksParamType> = new Map();
    private paramTypes: Map<string, BlocksValueType> = new Map();

    private static blocksWindow: IBlocksWindow | null = null;
    private static instance: BlocksInterface | null = null;

    private pubSubManager: IBlocksPubSubManager;
    private readonly propManager: BlocksPropertyManager | undefined;
    private readonly blocksTagManager: BlocksTagManager | undefined;
    private scannerGroup: ScannerGroup | undefined;

    private readonly isSameOrigin: boolean;

    public static getInstance(): BlocksInterface | null {
        if (typeof window === 'undefined') return null;
        if (BlocksInterface.instance) return BlocksInterface.instance;
        BlocksInterface.instance = new BlocksInterface();
        return BlocksInterface.instance;
    }

    private constructor() {
        this.onUpdateParam = this.onUpdateParam.bind(this);
        this.onRegisterParam = this.onRegisterParam.bind(this);
        BlocksInterface.blocksWindow = window?.top as unknown as IBlocksWindow;
        let sameOrigin = true;

        // Check if blocksWindow is served from same origin
        if (window?.top && window.top !== window.self) {
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
        this.isSameOrigin = sameOrigin;

        if (!sameOrigin) {
            this.pubSubManager = new BlocksPubSubManagerOther(BlocksInterface.blocksWindow, this.onUpdateParam, this.onRegisterParam);
        } else {
            this.pubSubManager = new BlocksPubSubManager(BlocksInterface.blocksWindow, this.onUpdateParam, this.onRegisterParam);
            this.propManager = new BlocksPropertyManager(BlocksInterface.blocksWindow, this.onUpdateParam, this.onRegisterParam);
            this.blocksTagManager = new BlocksTagManager(
                BlocksInterface.blocksWindow,
                this.onUpdateTags,
                this.onAddTags,
                this.onRemoveTags
            );
            this.scannerGroup = new ScannerGroup(BlocksInterface.blocksWindow, [this.blocksTagManager, this.propManager]);
            this.scannerGroup.startScanning();
        }
    }

    /**
     * Get or create a Svelte store for a parameter path with bidirectional sync
     * @param path - The parameter path
     * @returns A Svelte writable store
     */
    public getParamStore(path: string): Writable<BlocksParamType> {
        path = BlocksInterface.fixPath(path);

        if (this.paramStores.has(path)) {
            return this.paramStores.get(path) as Writable<BlocksParamType>;
        }

        const isLocal = BlocksInterface.isLocalParam(path);

        // Subscribe to server param if not already subscribed
        if (!isLocal) this.subscribeServerParam(path);
        if (isLocal && !this.isSameOrigin) this.subscribeServerParam(path);

        // Create a new store with an initial value
        const initialValue = this.paramValues.get(path);
        const store = writable<BlocksParamType>(initialValue);

        // Subscribe to store changes and update server param
        store.subscribe((value: BlocksParamType | undefined) => {
            const currentValue = this.paramValues.get(path);

            // Only update if value actually changed to avoid loops
            if (value !== currentValue && value !== undefined) {
                this.paramValues.set(path, value);
                if (isLocal) {
                    const localPath = path.substring(PREFIX_LOCAL_PARAM.length);
                    this.setLocalParam(localPath, value);
                }
                else this.setServerParam(path, value);
            }
        });

        this.paramStores.set(path, store);
        return store;
    }
    public getParamValueType(path: string): BlocksValueType | undefined {
        path = BlocksInterface.fixPath(path);
        return this.paramTypes.get(path);
    }
    public getParamValue(path: string): BlocksParamType | undefined {
        path = BlocksInterface.fixPath(path);
        return this.paramValues.get(path);
    }

    /**
     * Called when a parameter value changes from the server
     * Updates the corresponding store
     */
    private onParamUpdate(paramLite: IBlocksParameterLite, type: BlocksValueType | null = null): void {
        let value = paramLite.value;
        if (type) {
            this.paramTypes.set(paramLite.name, type);
            value = BlocksHelper.fixValue(value, type);
        }
        this.paramValues.set(paramLite.name, value);

        const store = this.paramStores.get(paramLite.name);
        store?.set(value);
    }

    /**
     * Remove a parameter store subscription
     */
    private unsubscribeParam(path: string): void {
        this.paramStores.delete(path);
        this.paramValues.delete(path);
        this.paramTypes.delete(path);
    }

    /**
     * Clear all parameter stores
     */
    private clearAll(): void {
        this.paramStores.clear();
        this.paramValues.clear();
        this.paramTypes.clear();
    }

    private setLocalParam(name: string, value: BlocksParamType): void {
        if (this.isSameOrigin) {
            BlocksInterface.blocksWindow?.pixiAPI.propProvider.setLocal(name, value);
        } else {
            this.pubSubManager?.setValue(PREFIX_LOCAL_PARAM + name, value);
        }
    }
    private subscribeServerParam(path: string): void {
        this.pubSubManager?.subscribe(path);
    }
    private setServerParam(path: string, value: BlocksParamType): void {
        this.pubSubManager?.setValue(path, value);
    }


    // svelte -> blocks
    // https://pixilab.se/docs/blocks/api/javascript#additional_web_block_interaction_capabilities
    /**
     * https://pixilab.se/docs/blocks/api/javascript#action
     * "Keeps any enclosing Attractor Block in its active state."
     */
    public action(): void {
        BlocksInterface.postBlocksMessage('action');
    }

    /**
     * "Navigate to a specified block path inside the current root block."
     * @param path
     */
    public gotoBlock(path: string): void {
        BlocksInterface.postBlocksMessage('goto-block', path);
    }

    /**
     * "Navigate back, just like the browser's BACK button."
     */
    public goBack(): void {
        BlocksInterface.postBlocksMessage('go-back');
    }

    /**
     * "Tells any enclosing Locator block to locate the Spot path or Location ID specified."
     * @param location will be interpreted as a Location ID if numeric, otherwise as Spot path
     */
    public setLocation(location: string): void {
        BlocksInterface.postBlocksMessage('set-location', location);
    }
    public setTags(tags: string): void {
        this.blocksTagManager?.setTags(tags);
    }
    public setTagsOfSet(tagList: string, tagSet: string): void {
        this.blocksTagManager?.setTagsOfSet(tagList, tagSet);
    }
    public toggleTags(tags: string): void {
        this.blocksTagManager?.toggleTags(tags);
    }
    public addTags(tags: string): void {
        this.blocksTagManager?.addTags(tags);
    }
    public removeTags(tags: string): void {
        this.blocksTagManager?.removeTags(tags);
    }


    // blocks -> svelte

    private onAddTags(tags: string): void {
        console.log('addTags', tags);
    }

    private onShowLoaded(show: string): void {
    }

    private onRegisterParam(parameter: IBlocksParameter): void {
        // console.log('registerParam', parameter);
        this.onParamUpdate(parameter, parameter.type);
    }

    private onRemoveTags(tags: string): void {
        console.log('removeTags', tags);
    }

    private onUpdateParam(parameter: IBlocksParameterLite): void {
        this.onParamUpdate(parameter);
    }

    private updatePath(path: string): void {
    }

    private updateShow(show: string): void {
    }

    private onUpdateTags(tags: string): void {
        console.log('updateTags', tags);
    }


    // misc tooling
    private static postBlocksMessage(type: string, data: string | null = null): void {
        if (data) BlocksInterface.postMessage({type: type, data: data});
        else BlocksInterface.postMessage({type: type});
    }
    private static postMessage(message: any): void {
        BlocksInterface.blocksWindow?.postMessage(message, '*');
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
