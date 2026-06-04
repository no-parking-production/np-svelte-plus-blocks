import { writable, get, type Writable } from "svelte/store";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";

export class PathStore {
    private stores = new Map<string, Writable<BlocksParamType>>();
    private channel: BroadcastChannel;

    constructor(channelName = "fallback-cache-sync") {
        // Initialize the communication channel
        this.channel = new BroadcastChannel(channelName);

        // Listen for updates from other tabs
        this.channel.onmessage = (event) => {
            const { path, value } = event.data;

            // Update the local store silently (without broadcasting back)
            if (this.stores.has(path)) {
                this.stores.get(path)?.set(value);
            } else {
                // Optionally initialize it if this tab hasn't queried it yet
                this.stores.set(path, writable(value));
            }
        };
    }

    public getStore(path: string, initialValue?: BlocksParamType): Writable<BlocksParamType> {
        if (!this.stores.has(path)) {
            this.stores.set(path, writable<BlocksParamType>(initialValue));
        }
        return this.stores.get(path) as Writable<BlocksParamType>;
    }

    public set(path: string, value: BlocksParamType): void {
        // 1. Update this tab's UI
        this.getStore(path).set(value);

        // 2. Broadcast the change to all other open tabs
        this.channel.postMessage({ path, value });
    }

    public update(path: string, updater: (value: BlocksParamType) => BlocksParamType): void {
        const store = this.getStore(path);
        const newValue = updater(get(store));

        store.set(newValue);
        this.channel.postMessage({ path, value: newValue });
    }

    // ... (read and delete methods remain the same) ...

    /**
     * Call this when destroying the store (e.g., on app teardown)
     * to prevent memory leaks.
     */
    public destroy(): void {
        this.channel.close();
    }
}