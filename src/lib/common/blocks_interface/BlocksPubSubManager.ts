
import type {IBlocksAPI, IBlocksWindow} from "$lib/common/interfaces/BlocksApi.js";
import type {IPlayerPubSub} from "$lib/common/interfaces/blocks/IPlayerPubSub.js";
import {BlocksValueType} from "$lib/common/interfaces/blocks/ITypedParameter.js";
import type {
    parameterHandler,
    parameterHandlerLite
} from "$lib/common/blocks_interface/GenericPropertyManager.js";
import {GenericPropertyManager} from "$lib/common/blocks_interface/GenericPropertyManager.js";
import {
    BlocksSocketMessageName,
    type IBlocksMessageIn, type IBlocksMessageOut, type IPubSubData,
    PubSubData, PubSubSubscribeMessage, SetMessage
} from "$lib/common/interfaces/blocks/BlocksSocket.js";


export class BlocksPubSubManager {
    private topWindow: IBlocksWindow;
    private pixiApi: IBlocksAPI;
    private pupSub: IPlayerPubSub;
    private readonly genericPropertyManager: GenericPropertyManager;
    private enabled: boolean;
    constructor(
        blocksWindow: IBlocksWindow,
        onParamChange: parameterHandlerLite,
        onParamDiscovery: parameterHandler,
    ) {
        this.enabled = true;
        this.topWindow = blocksWindow;
        this.pixiApi = this.topWindow.pixiAPI;
        this.pupSub = this.pixiApi.pubSub;

        this.genericPropertyManager = new GenericPropertyManager(onParamChange, onParamDiscovery);

        this.pupSub.socket.addEventListener('message', e => this.onMessage(e));
    }
    deInit() {
        console.log('deInit');
        this.enabled = false;
        this.pupSub.socket.removeEventListener('message', e => this.onMessage(e));
    }
    public subscribe(path: string): void {
        this.sendSubscribe(path);
    }
    public setValue(path: string, value: string) {
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
        this.messageReceived(messageEvent.data);
    }
    private messageReceived(data: string) {
        if (!this.enabled) return;
        const messages = JSON.parse(data) as IBlocksMessageIn[];
        for (const message of messages) {
            switch (message.name) {
                case BlocksSocketMessageName.Change:
                    const data = message.param as IPubSubData;
                    this.genericPropertyManager.dataReceived(data.data, data.path);
                    break;
            }
        }
    }
    private sendSubscribe(path: string): void {
        this.send([new PubSubSubscribeMessage(path)]);
    }
    private sendChange(change: IPubSubData): void {
        this.send([new SetMessage(change)]);
    }
    private send(messages: IBlocksMessageOut[]): void {
        const json = JSON.stringify(messages);
        this.pupSub.socket.send(json);
    }

}