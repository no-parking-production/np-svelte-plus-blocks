import { writable, type Writable } from 'svelte/store';
import type { IAppToBlocksInterface } from './interfaces/IAppToBlocksInterface.ts';
import type {IBlocksToAppInterface} from "$lib/common/interfaces/IBlocksToAppInterface.js";
import type {IBlocksParameter} from "$lib/common/interfaces/IBlocksParameter.js";
import type {IBlocksParameterLite} from "$lib/common/interfaces/IBlocksParameterLite.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";

const PREFIX_LOCAL_PARAM = 'Local.parameter.';

export class BlocksInterface implements IBlocksToAppInterface {
    private appToBlocks: IAppToBlocksInterface;
    private paramStores: Map<string, Writable<BlocksParamType>> = new Map();
    private paramValues: Map<string, BlocksParamType> = new Map();

    private static instance: BlocksInterface | null = null;

    public static getInstance(): BlocksInterface | null {
        if (BlocksInterface.instance) return BlocksInterface.instance;
        try {
            // @ts-ignore
            const connector = window.top?.['instance_apiConnector'] as IAppToBlocksInterface;
            if (!connector) return null;
            BlocksInterface.instance = new BlocksInterface(connector);
            connector.connect(BlocksInterface.instance);
            return BlocksInterface.instance;
        } catch (e) {
            console.error('Cannot access parent window connector', e);
        }
        return null;
    }

    constructor(appToBlocks: IAppToBlocksInterface) {
        this.appToBlocks = appToBlocks;
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
        if (!isLocal) this.appToBlocks.subscribeServerParam(path);

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
                    this.appToBlocks.setLocalParam(localPath, value);
                }
                else this.appToBlocks.setServerParam(path, String(value));
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

    private static fixPath(path: string): string {
        if (path.indexOf('.') !== -1) return path;
        return path.startsWith(PREFIX_LOCAL_PARAM) ? path : PREFIX_LOCAL_PARAM + path;
    }
    private static isLocalParam(path: string): boolean {
        return path.startsWith(PREFIX_LOCAL_PARAM);
    }
}
