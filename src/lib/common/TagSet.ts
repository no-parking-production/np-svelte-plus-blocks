export class TagSet {

    protected readonly _tags: Set<string>;

    public get copy(): TagSet {
        return new TagSet(this._tags);
    }
    public get str(): string {
        return Array.from(this._tags.values()).join(',');
    }
    public get size(): number {
        return this._tags.size;
    }
    public get values(): SetIterator<string> {
        return this._tags.values();
    }

    constructor(tags?: string[] | Set<string>) {
        if (tags === undefined) tags = new Set<string>();
        if (Array.isArray(tags)) tags = new Set<string>(tags);
        this._tags = new Set<string>(tags.values());
    }


    public difference(other: TagSet): TagSet {
        return new TagSet(this._tags.difference(other._tags));
    }
    public union(other: TagSet): TagSet {
        return new TagSet(this._tags.union(other._tags));
    }
    public intersection(other: TagSet): TagSet {
        return new TagSet(this._tags.intersection(other._tags));
    }
    public has(tag: string): boolean {
        return this._tags.has(tag);
    }
    public isSubsetOf(other: TagSet): boolean {
        return this._tags.isSubsetOf(other._tags);
    }

    public static readonly EMPTY = new TagSet();

    /**
     * Creates a new TagSet from a string or array of strings.
     * @param str
     */
    public static fresh(str: string | string[]): TagSet {
        if (typeof str === 'string') return new TagSet(str.split(',').map(s => s.trim()));
        return new TagSet(str);
    }
}