import type {ITypedParameter} from "$lib/common/interfaces/blocks/ITypedParameter.js";

export enum BlocksSocketMessageName {
    Change = 'change',
    GotoBlock = 'gotoBlock',
    Navigate = 'navigate',
    PictureSource = 'pictureSource',
    Param = 'param',
    ParamEstablish = 'paramEstab',
    Seek = 'seek',
    Set = 'set',
    Subscribe = 'subscribe',
    Tick = 'tick',
    Volume = 'volume',
}
export enum BlocksDataType {
    GotoBlock = '.GotoBlockPar',
    Num = '.NumPar',
    PubSub = '.PubSubPar',
    SetParam = '.SetParamPar',
    SpotParams = '.SpotParamsPar',
    Str1 = '.Str1Par',
    Str2 = '.Str2Par',
    Tick = '.TickPar',
}
export interface IMessageData {
    type: BlocksDataType
}
export interface IGotoBlockData extends IMessageData {
    path: string,
    doSeek: boolean,
    seek: number,
    doTransport: boolean,
    play: boolean,
}
export interface IPubSubPathData extends IMessageData {
    path: string,
}
export interface IPubSubData extends IPubSubPathData {
    data: string | number | boolean;
}
export interface ISetParamData extends IMessageData {
    force: boolean,
    parName: string,
    parValue: string,
}
export interface ISpotParamsData extends IMessageData {
    params: ITypedParameter[],
}
export interface IStr1Data extends IMessageData {
    s1: string,
}
export interface IStr2Data extends IMessageData {
    s1: string,
    s2: string,
}

export interface ITickData extends IMessageData {
    sessionId: number,
    serverTime: number,
}
export class PubSubData implements IPubSubData {
    data: string | number | boolean;
    path: string;
    public readonly type: BlocksDataType = BlocksDataType.PubSub;
    constructor(path: string, data: string | number | boolean) {
        this.path = path;
        this.data = data;
    }
}
export interface IGenericBlocksMessage {
    name: BlocksSocketMessageName,
    param: IMessageData,
}
export interface IBlocksMessageIn extends IGenericBlocksMessage {
    id: number,
    isResponse: boolean,
}
export interface IBlocksMessageOut extends IGenericBlocksMessage {

}
export class PubSubSubscribeMessage implements IBlocksMessageOut {
    name: BlocksSocketMessageName = BlocksSocketMessageName.Subscribe;
    param: IPubSubPathData;
    constructor(path: string) {
        this.param = {
            path: path,
            type: BlocksDataType.PubSub,
        }
    }
}
export class SetMessage implements IBlocksMessageOut {
    name: BlocksSocketMessageName = BlocksSocketMessageName.Set;
    param: IPubSubData;
    constructor(data: PubSubData) {
        this.param = data;
    }
}