import type {IBlocksParameter} from "$lib/common/interfaces/IBlocksParameter.js";
import type {IBlocksParameterLite} from "$lib/common/interfaces/IBlocksParameterLite.js";
import type {IParamSubscriber} from "$lib/common/interfaces/blocks/IPlayerPubSub.js";
import type {IBlocksAPI, IBlocksWindow} from "$lib/common/interfaces/BlocksApi.js";
import type {IBlocksPropertyProvider} from "$lib/common/interfaces/blocks/IBlocksPropertyProvider.js";
import {GenericPropertyManager} from "$lib/common/blocks_interface/GenericPropertyManager.js";
import {BlocksValueType} from "$lib/common/interfaces/blocks/ITypedParameter.js";
import {BlocksHelper} from "$lib/common/blocks_interface/BlocksHelper.js";
import {AsyncSignal} from "$lib/common/events/AsyncSignal.js";
import {AbstractIntervalScanner} from "$lib/common/blocks_interface/same_origin/AbstractIntervalScanner.js";
import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";


const BASE_PATH_LOCAL_PARAMETER = 'Local.parameter.';

export type parameterHandler = (parameter: IBlocksParameter) => void;
export type parameterHandlerLite = (parameter: IBlocksParameterLite) => void;
export class BlocksPropertyManager extends AbstractIntervalScanner implements IParamSubscriber {
    public readonly onParamChange: AsyncSignal<BlocksPropertyManager, IBlocksParameterLite> = new AsyncSignal<BlocksPropertyManager, IBlocksParameterLite>();
    public readonly onParamDiscovery: AsyncSignal<BlocksPropertyManager, IBlocksParameter> = new AsyncSignal<BlocksPropertyManager, IBlocksParameter>();

    private topWindow: IBlocksWindow;
    private pixiApi: IBlocksAPI;
    private propProvider: IBlocksPropertyProvider;
    private readonly genericPropertyManager : GenericPropertyManager;
    constructor (
        blocksWindow: IBlocksWindow,
        onParamChange: parameterHandlerLite,
        onParamDiscovery: parameterHandler,
    ) {
        super(blocksWindow);
        this.topWindow = blocksWindow;
        this.pixiApi = this.topWindow.pixiAPI;
        this.propProvider = this.pixiApi?.propProvider;

        this.genericPropertyManager = new GenericPropertyManager(
            pLite =>{
                onParamChange(pLite);
                this.onParamChange.trigger(this, pLite);
            }, p => {
                onParamDiscovery(p);
                this.onParamDiscovery.trigger(this, p);
            }
        );

        const pixiApiFound = this.pixiApi !== undefined;
        const propertyProviderFound = this.propProvider !== undefined;
        // special properties for noting whether pixi API / property provider have been found
        this.genericPropertyManager.discovery(
            BASE_PATH_LOCAL_PARAMETER + '_npi_pixi_api_found',
            pixiApiFound ? 'true' : 'false',
            'has pixi API been found',
            BlocksValueType.Boolean
        );
        this.genericPropertyManager.discovery(
            BASE_PATH_LOCAL_PARAMETER + '_npi_property_provider_found',
            propertyProviderFound ? 'true' : 'false',
            'has a property provider been found',
            BlocksValueType.Boolean
        );
        if (!propertyProviderFound) {
            console.warn('property provider could not be found');
            return;
        }

        this.discoverProperties();
        this.subscribeProperties();
    }
    public hasProperty(path: string): boolean {
        return this.genericPropertyManager.hasParameter(path);
    }
    public getValue(path: string): BlocksParamType {
        return this.genericPropertyManager.props[path].value;
    }
    /***
     * will return bool value or interpret value as boolean otherwise
     * (e.g. false: 'false', 0, '', null, undefined, else true)
     * @param path
     */
    public getBoolValue(path: string): boolean {
        if (!this.genericPropertyManager.hasParameter(path)) return false;
        return BlocksHelper.isTruthy(String(this.genericPropertyManager.props[path].value));
    }
    public setValue(path: string, value: any) {
        if (this.genericPropertyManager.hasParameter(path)) {
            this.propProvider?.setLocal(path.substring(BASE_PATH_LOCAL_PARAMETER.length), value);
        }
    }

    deInit() {
        this.unSubscribeProperties();
    }
    dataReceived(value: string|boolean|number, path: string) {
        this.genericPropertyManager.dataReceived(value, path);
    }
    private discoverProperties () {
        const prefix = this.propProvider.pathPrefix;
        const typedParams = this.propProvider.typedParams;
        let logMessage = "Discovered Parameters:\n";
        for (const [name, typedParameter] of Object.entries(typedParams)) {
            const path = prefix + name;
            this.genericPropertyManager.discovery(
                path,
                typedParameter.value.toString(),
                typedParameter.comment ? typedParameter.comment.toString() : '',
                typedParameter.type
            );
            logMessage += `
  Path:    ${path}
  Value:   ${typedParameter.value}${typedParameter.comment ? `\n  Comment: ${typedParameter.comment}` : ''}         
---`;
        }
        console.log(logMessage);
    }
    private subscribeProperties() {
        const prefix = this.propProvider.pathPrefix;
        const allSubs = this.propProvider.paramSubscribers;
        for (const [key, value] of Object.entries(this.genericPropertyManager.props)) {
            const name = key.substring(prefix.length);
            let set = allSubs[name];
            if (!set) {
                set = new Set<IParamSubscriber>();
                allSubs[name] = set;
            }
            if (!set.has(this)) set.add(this);
        }
    }
    private unSubscribeProperties() {
        const allSubs = this.propProvider.paramSubscribers;
        for (const [key, set] of Object.entries(allSubs)) {
            if (set.has(this)) set.delete(this);
        }
    }
    protected scan() {

    }

}