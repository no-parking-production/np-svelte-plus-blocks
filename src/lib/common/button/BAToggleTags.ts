import {ButtonActionWithTags} from "$lib/common/button/ButtonAction.js";
import {TagSet} from "$lib/common/TagSet.js";

export class BAToggleTags extends ButtonActionWithTags {
    declare '@type': 'toggleTags';
    public readonly tagsToToggle: TagSet;

    constructor(
        tags: string,
    ) {
        super();
        this.tagsToToggle = TagSet.fresh(tags);
        this.setActive(this.tagsToToggle.isSubsetOf(this.currentValue));
    }
    onDown() {
        // nothing to do
    }
    onUp() {
        this.blocksInterface?.toggleTags(this.tagsToToggle.str);
    }
    protected onValueChange(tags: TagSet): void {
        if (!this.tagsToToggle) return;
        this.setActive(this.tagsToToggle.isSubsetOf(tags));
    }
}