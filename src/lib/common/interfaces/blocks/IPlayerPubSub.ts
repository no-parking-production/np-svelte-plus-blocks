import type {BlocksParamType, Dictionary} from "$lib/common/interfaces/blocks/Shared.js";

export interface IPlayerPubSub {
    socket: WebSocket;
    subscribers: Dictionary<IBlocksSubscription>;
}
export interface IBlocksSubscription {
    handlers: Set<IParamSubscriber>;
    lastValue: BlocksParamType;
}
export interface IParamSubscriber {
    dataReceived(value: BlocksParamType, path: string): void,
}