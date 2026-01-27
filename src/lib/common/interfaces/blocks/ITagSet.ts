import type {Dictionary} from "$lib/common/interfaces/blocks/Shared.js";

export interface ITagSet {
    tagDict?: Dictionary<boolean>,
    tags: string,
    constructor(tags: string): void,
    clone(): ITagSet,
    get(): string,
    getDict(): Dictionary<boolean>,
    add(tagSet: ITagSet): void,
    intersection(tagSet: ITagSet): ITagSet,
    remove(tagSet: ITagSet): void,
    toggle(tagSet: ITagSet): void,
}