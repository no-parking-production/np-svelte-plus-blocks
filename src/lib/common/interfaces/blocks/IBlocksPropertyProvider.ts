import type {BlocksParamType, Dictionary} from "$lib/common/interfaces/blocks/Shared.js";
import type {ITypedParameter} from "$lib/common/interfaces/blocks/ITypedParameter.js";
import type {IParamSubscriber} from "$lib/common/interfaces/blocks/IPlayerPubSub.js";

export interface IBlocksPropertyProvider {
    /** array /w 5 objects [0]: local types params - [3]: Spot params */
    paramSource: {}[],
    paramSubscribers: Dictionary<Set<IParamSubscriber>>,
    pathPrefix: string,
    typedParams: Dictionary<ITypedParameter>,
    getAllParams(): {},
    setLocal(key: string, value: BlocksParamType): void,
}
