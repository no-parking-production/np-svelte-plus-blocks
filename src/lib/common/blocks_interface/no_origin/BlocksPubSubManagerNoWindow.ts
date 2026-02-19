import type {IBlocksPubSubManager} from "$lib/common/blocks_interface/interfaces/IBlocksPubSubManager.js";
import {
    GenericPropertyManager, type parameterHandler,
    type parameterHandlerLite
} from "$lib/common/blocks_interface/GenericPropertyManager.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import {BlocksValueType} from "$lib/common/interfaces/blocks/ITypedParameter.js";

export class BlocksPubSubManagerNoWindow implements IBlocksPubSubManager {
    private topWindow: undefined;

    private readonly genericPropertyManager: GenericPropertyManager;
    private enabled: boolean;
    constructor(
        blocksWindow: undefined,
        onParamChange: parameterHandlerLite,
        onParamDiscovery: parameterHandler,
    ) {
        this.enabled = true;
        this.topWindow = blocksWindow;


        this.genericPropertyManager = new GenericPropertyManager(onParamChange, onParamDiscovery);
        // window.addEventListener('message', e => this.onMessage(e));
    }
    deInit() {
        console.log('deInit');
        this.enabled = false;
        // window.removeEventListener('message', e => this.onMessage(e));
    }
    public subscribe(path: string): void {
        this.sendSubscribe(path);
    }
    public setValue(path: string, value: BlocksParamType): void {
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
    private onMessage(messageEvent: MessageEvent): void {
        if (!this.enabled) return;
        if (messageEvent.data.type === "pubsub-data") {
            this.messageReceived(messageEvent.data as IPubSubData);
        }
    }
    private messageReceived(data: IPubSubData) {
        this.genericPropertyManager.dataReceived(data.value, data.path);
    }
    private sendSubscribe(path: string): void {
        console.log('sendSubscribe: no browser', path);
    }
    private sendChange(change: IPubSubData): void {
        console.log('sendChange: no browser', change);
    }


}
interface IPubSubData {
    type: 'pubsub-data',
    path: string,
    value: any
}
class PubSubData implements IPubSubData {
    public readonly type = 'pubsub-data';
    constructor(public path: string, public value: any) {
    }
}
