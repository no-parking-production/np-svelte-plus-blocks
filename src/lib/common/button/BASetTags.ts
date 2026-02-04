import {ButtonActionWithTags} from "$lib/common/button/ButtonAction.js";
import {TagSet} from "$lib/common/TagSet.js";

export class BASetTags extends ButtonActionWithTags {
    declare '@type': 'setTags';
    public readonly tagsToSet: TagSet;
    public readonly ofSet: TagSet;

    constructor(
        tags: string,
        ofSet: string = '',
    ) {
        super();
        this.tagsToSet = TagSet.fresh(tags);
        this.ofSet = TagSet.fresh(ofSet);
        this.setActive(this.tagsToSet.isSubsetOf(this.currentValue));
    }
    onDown() {
        // nothing to do
    }
    onUp() {
        this.blocksInterface?.setTagsOfSet(this.tagsToSet.str, this.ofSet.str);
    }
    protected onValueChange(tags: TagSet): void {
        if (!this.tagsToSet) return;
        this.setActive(this.tagsToSet.isSubsetOf(tags));
    }
}