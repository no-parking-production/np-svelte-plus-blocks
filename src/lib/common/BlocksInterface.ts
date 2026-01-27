import { writable, type Writable } from 'svelte/store';
import type {IBlocksToAppInterface} from "$lib/common/interfaces/IBlocksToAppInterface.js";
import type {IBlocksParameter} from "$lib/common/interfaces/IBlocksParameter.js";
import type {IBlocksParameterLite} from "$lib/common/interfaces/IBlocksParameterLite.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import type {IBlocksWindow} from "$lib/common/interfaces/BlocksApi.js";
import {BlocksPubSubManager} from "$lib/common/blocks_interface/BlocksPubSubManager.js";
import {BlocksPropertyManager} from "$lib/common/blocks_interface/BlocksPropertyManager.js";

const PREFIX_LOCAL_PARAM = 'Local.parameter.';

export class BlocksInterface implements IBlocksToAppInterface {
    private paramStores: Map<string, Writable<BlocksParamType>> = new Map();
    private paramValues: Map<string, BlocksParamType> = new Map();

    private static blocksWindow: IBlocksWindow | null = null;
    private static instance: BlocksInterface | null = null;

    private pubSubManager: BlocksPubSubManager;
    private propManager: BlocksPropertyManager;

    public static getInstance(): BlocksInterface | null {
        if (typeof window === 'undefined') return null;
        if (BlocksInterface.instance) return BlocksInterface.instance;
        try {
            BlocksInterface.instance = new BlocksInterface();
            return BlocksInterface.instance;
        } catch (e) {
            console.error('Cannot access parent window connector', e);
        }
        return null;
    }

    constructor() {
        this.updateParam = this.updateParam.bind(this);
        this.registerParam = this.registerParam.bind(this);
        BlocksInterface.blocksWindow = window?.top as unknown as IBlocksWindow;
        this.pubSubManager = new BlocksPubSubManager(BlocksInterface.blocksWindow, this.updateParam, this.registerParam);
        this.propManager = new BlocksPropertyManager(BlocksInterface.blocksWindow, this.updateParam, this.registerParam);
    }

    /**
     * Get or create a Svelte store for a parameter path with bidirectional sync
     * @param path - The parameter path
     * @returns A Svelte writable store
     */
    getParamStore(path: string): Writable<BlocksParamType> {
        path = BlocksInterface.fixPath(path);
        // console.log('getParamStore', path);
        if (this.paramStores.has(path)) {
            return this.paramStores.get(path) as Writable<BlocksParamType>;
        }

        const isLocal = BlocksInterface.isLocalParam(path);

        // Subscribe to server param if not already subscribed
        if (!isLocal) this.subscribeServerParam(path);

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
                else this.setServerParam(path, String(value));
            }
        });

        this.paramStores.set(path, store);
        return store;
    }

    /**
     * Called when a parameter value changes from the server
     * Updates the corresponding store
     */
    onParamUpdate(path: string, value: string | number | boolean): void {
        this.paramValues.set(path, value);

        const store = this.paramStores.get(path);
        if (store) {
            store.set(value);
        }
    }

    /**
     * Remove a parameter store subscription
     */
    unsubscribeParam(path: string): void {
        this.paramStores.delete(path);
        this.paramValues.delete(path);
    }

    /**
     * Clear all parameter stores
     */
    clearAll(): void {
        this.paramStores.clear();
        this.paramValues.clear();
    }
    public setLocalParam(name: string, value: string | number | boolean): void {
        BlocksInterface.blocksWindow?.pixiAPI.propProvider.setLocal(name, value);
    }
    public subscribeServerParam(path: string): void {
        this.pubSubManager?.subscribe(path);
    }
    public setServerParam(path: string, value: string): void {
        this.pubSubManager?.setValue(path, value);
    }


    // svelte -> blocks



    // blocks -> svelte

    addTags(tags: string): void {
    }

    onShowLoaded(show: string): void {
    }

    registerParam(parameter: IBlocksParameter): void {
        this.onParamUpdate(parameter.name, parameter.value);
    }

    removeTags(tags: string): void {
    }

    updateParam(parameter: IBlocksParameterLite): void {
        this.onParamUpdate(parameter.name, parameter.value)
    }

    updatePath(path: string): void {
    }

    updateShow(show: string): void {
    }

    updateTags(tags: string): void {
    }


    // misc tooling
    private static fixPath(path: string): string {
        if (path.indexOf('.') !== -1) return path;
        return path.startsWith(PREFIX_LOCAL_PARAM) ? path : PREFIX_LOCAL_PARAM + path;
    }
    private static isLocalParam(path: string): boolean {
        return path.startsWith(PREFIX_LOCAL_PARAM);
    }
}
