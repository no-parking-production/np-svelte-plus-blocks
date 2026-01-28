import type {IBlocksParameter} from "$lib/common/interfaces/IBlocksParameter.js";
import type {IBlocksParameterLite} from "$lib/common/interfaces/IBlocksParameterLite.js";
import {BlocksValueType} from "$lib/common/interfaces/blocks/ITypedParameter.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";


export type parameterHandler = (parameter: IBlocksParameter) => void;
export type parameterHandlerLite = (parameter: IBlocksParameterLite) => void;

export class GenericPropertyManager {
    public readonly props: Dictionary<IBlocksParameter> = {};
    private readonly onParamChange: parameterHandlerLite;
    private readonly onParamDiscovery: parameterHandler;
    private readonly random: number;

    constructor(onParamChange: parameterHandlerLite, onParamDiscovery: parameterHandler) {
        this.onParamChange = onParamChange;
        this.onParamDiscovery = onParamDiscovery;
        this.random = Math.random();
    }
    public hasParameter(path: string): boolean {
        const property = this.props[path];
        return property !== undefined;
    }
    public getParameterType(path: string): BlocksValueType {
        const property = this.props[path];
        if (property === undefined) return BlocksValueType.String;
        return property.type;
    }
    public dataReceived(value: BlocksParamType, path: string): void {
        const property = this.props[path];
        if (property === undefined) {
            let type = BlocksValueType.String;
            switch (typeof value) {
                case 'boolean':
                    type = BlocksValueType.Boolean;
                    break;
                case 'number':
                    type = BlocksValueType.Number;
                    break;
            }
            this.discovery(path, value, '', type);
            console.log(`discovery: ${path} ${value}`);
        } else {
            const currentValue = property.value;
            if (currentValue !== value) {
                property.value = value;
                this.onParamChange({name: path, value: value});
            }
        }
    }
    public discovery(path: string, value: BlocksParamType, comment: string, type: BlocksValueType): void {
        const property = this.props[path];
        if (property === undefined) {
            const parameter: IBlocksParameter = {
                name: path,
                value: value,
                comment: '',
                type: type
            };
            this.props[path] = parameter;
            this.onParamDiscovery(parameter);
        }
    }
}
interface Dictionary<Group> {
    [id: string]: Group,
}