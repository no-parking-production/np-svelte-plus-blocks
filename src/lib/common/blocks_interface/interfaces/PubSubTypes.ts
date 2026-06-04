import type {BlocksParamPath, BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";

export enum PubSubMessageType {
    Subscribe = 'pubsub-subscribe',
    Data = 'pubsub-data',
    Set = 'pubsub-set',
}


export interface IPubSubSubscribe {
    type: PubSubMessageType.Subscribe,
    path: BlocksParamPath
}
export interface IPubSubData {
    type: PubSubMessageType.Data,
    path: BlocksParamPath,
    value: BlocksParamType
}
export interface IPubSubSet {
    type: PubSubMessageType.Set,
    path: BlocksParamPath,
    value: BlocksParamType
}


export class PubSubData implements IPubSubData {
    public readonly type = PubSubMessageType.Data;
    constructor(public path: BlocksParamPath, public value: BlocksParamType) {
    }
}
export class PubSubSet implements IPubSubSet {
    public readonly type = PubSubMessageType.Set;
    constructor(public path: BlocksParamPath, public value: BlocksParamType) {
    }
}
export class PubSubSubscribe implements IPubSubSubscribe {
    public readonly type = PubSubMessageType.Subscribe;
    constructor(public path: BlocksParamPath) {
    }
}