import type {IBlocksAPI, IBlocksWindow} from "$lib/common/interfaces/BlocksApi.js";
import type {BlocksParamType, Dictionary} from "$lib/common/interfaces/blocks/Shared.js";

export class BlocksHelper {
    // private static blocks: IBlocksWindow = window.top as IBlocksWindow;
    // private static blocksApi: IBlocksAPI = BlocksHelper.blocks.pixiAPI;
    //
    // public static getParam(key: string, fallback: BlocksParamType = false): BlocksParamType {
    //     if (BlocksHelper.blocksApi === undefined) return fallback;
    //     const params = BlocksHelper.blocksApi.propProvider?.getAllParams();
    //     // @ts-ignore
    //     const value: BlocksParamType | undefined = params ? params[key] : undefined;
    //     return value === undefined ? fallback : value;
    // }
    // public static setParam(key: string, value: string | number | boolean): void {
    //     if (BlocksHelper.blocksApi === undefined) return;
    //     BlocksHelper.blocksApi.propProvider.setLocal(key, value);
    // }
    // public static  getParamAsBoolean(key: string, fallback = undefined): boolean {
    //     const value = this.getParam(key, fallback);
    //     if (value == undefined) return false;
    //     switch (typeof value) {
    //         case 'boolean':
    //             return value;
    //         case 'number':
    //             return value != 0;
    //         case 'string':
    //             return BlocksHelper.isTruthy(value);
    //     }
    // }
    // public static getParamAsFloat(key: string, fallback = undefined): number {
    //     const value = this.getParam(key, fallback);
    //     if (value == undefined) return 0;
    //     switch (typeof value) {
    //         case 'boolean':
    //             return value ? 1 : 0;
    //         case 'number':
    //             return value;
    //         case 'string':
    //             return parseFloat(value);
    //     }
    // }
    // public static getParamAsString(key: string, fallback = undefined): string {
    //     const value = this.getParam(key, fallback);
    //     if (value == undefined) return '';
    //     switch (typeof value) {
    //         case 'boolean':
    //             return value ? 'true' : 'false';
    //         case 'number':
    //             return value.toString();
    //         case 'string':
    //             return value;
    //     }
    // }

    /**
     * Determines if the provided string is considered "truthy". A string is
     * considered "truthy" if it is not undefined, null, empty, '0', 'false', 'no', or 'off'.
     *
     * @param {string | null | undefined} stringValue - The string to evaluate.
     * @return {boolean} - Returns true if the string is considered "truthy", otherwise returns false.
     */
    public static isTruthy(stringValue: string | null | undefined): boolean {
        if (stringValue === undefined || stringValue === null || stringValue === '' || stringValue === '0') return false;
        const lowerCase = stringValue.toLowerCase();
        return !(lowerCase === 'false' || lowerCase === 'no' || lowerCase === 'off');
    }




    /**
     * Counts the number of tags present in a set.
     *
     * @param {string[]} tags - The array of tags to check.
     * @param {Dictionary<boolean>} tagSet - The set of tags to check against.
     * @return {number} - The count of tags found in the set.
     */
    private static getTagsInSetCount(tags: string[], tagSet: Dictionary<boolean>): number {
        let matchCount = 0;
        for (const tag of tags) {
            if (tagSet[tag]) {
                matchCount++;
            }
        }
        return matchCount;
    }

    /**
     * Converts a comma-separated list of tags into an ITagSet.
     *
     * @param {string} commaSeparatedTags - The comma-separated list of tags.
     * @return {ITagSet} The resulting ITagSet.
     */
    public static convertToTagSet(commaSeparatedTags: string): Dictionary<boolean> {
        const tags = commaSeparatedTags.split(",");
        const tagSet: Dictionary<boolean> = {};

        for (const tag of tags) {
            tagSet[tag.trim()] = true;
        }

        return tagSet;
    }
    
}