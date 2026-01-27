import type {IBlocksAPI, IBlocksWindow} from "$lib/common/interfaces/BlocksApi.js";
import {EventSubscription} from "$lib/common/events/EventSubscription.js";
import {AbstractIntervalScanner} from "$lib/common/blocks_interface/AbstractIntervalScanner.js";
import type {ITagSet} from "$lib/common/interfaces/blocks/ITagSet.js";

export type TagChangeHandler = (tags: string) => void;
export class BlocksTagManager extends AbstractIntervalScanner {
    private blocksWindow: IBlocksWindow;
    private blocksApi: IBlocksAPI;
    private readonly onTagsChange: EventSubscription<string> = new EventSubscription<string>();
    private readonly onTagsAdd: EventSubscription<string> = new EventSubscription<string>();
    private readonly onTagsRemove: EventSubscription<string> = new EventSubscription<string>();
    private lastTags: ITagSet;

    private tagSetConstructor: new (tags: string) => ITagSet;

    constructor(
        blocksWindow: IBlocksWindow,
        onTagsChange?: TagChangeHandler,
        onTagsAdd?: TagChangeHandler,
        onTagsRemove?: TagChangeHandler,
    ) {
        super(blocksWindow);
        this.blocksWindow = blocksWindow;
        this.blocksApi = blocksWindow.pixiAPI;
        this.tagSetConstructor = this.blocksApi.tagSet.constructor as unknown as new (tags: string) => ITagSet;
        this.lastTags = this.constructTagSet('');
        if (onTagsChange) this.onTagsChange.subscribe(onTagsChange);
        if (onTagsAdd) this.onTagsAdd.subscribe(onTagsAdd);
        if (onTagsRemove) this.onTagsRemove.subscribe(onTagsRemove);
    }
    protected scan() {
        const tagsCopy = this.blocksApi.appliedTags.clone();
        const intersection = tagsCopy.intersection(this.lastTags);
        const addedTags = tagsCopy.clone();
        addedTags.remove(intersection);
        const removedTags = this.lastTags.clone();
        removedTags.remove(intersection);
        const addCount = Object.keys(addedTags.getDict()).length;
        const removeCount = Object.keys(removedTags.getDict()).length;
        let change = false;
        if (addCount > 0) {
            this.onTagsAdd.emit(addedTags.get());
            change = true;
        }
        if (removeCount > 0) {
            this.onTagsRemove.emit(removedTags.get());
            change = true;
        }
        if (change) {
            this.lastTags = tagsCopy;
            this.onTagsChange.emit(this.lastTags.get());
        }

    }
    public setTags(tags: string): void {
        this.postBlocksMessage('set-tags', tags);
    }
    public setTagsOfSet(tagList: string, tagSet: string): void {
        const tags = this.constructTagSet(tagList);
        const set = this.constructTagSet(tagSet);
        this.blocksApi.tagSet.remove(set);
        this.blocksApi.tagSet.add(tags);
        this.setTags(this.blocksApi.tagSet.get());
    }
    public toggleTags(tags: string): void {
        const tagsToToggle = this.constructTagSet(tags);
        this.blocksApi.tagSet.toggle(tagsToToggle);
        this.setTags(this.blocksApi.tagSet.get());
    }
    public addTags(tagList: string): void {
        const tags = this.constructTagSet(tagList);
        this.blocksApi.tagSet.add(tags);
        this.setTags(this.blocksApi.tagSet.get());
    }
    public removeTags(tagList: string): void {
        const tags = this.constructTagSet(tagList);
        this.blocksApi.tagSet.remove(tags);
        this.setTags(this.blocksApi.tagSet.get());
    }

    private tagSetCopy(tagSet: ITagSet) : ITagSet {
        return this.constructTagSet(tagSet.tags);
    }

    private constructTagSet(tagSet: string) : ITagSet {
        return new this.tagSetConstructor(tagSet);
    }

    private postBlocksMessage(type: string, data: string) {
        this.postMessage({type: type, data: data});
    }
    private postMessage(message: any): void {
        this.blocksWindow.postMessage(message, '*');
    }
}