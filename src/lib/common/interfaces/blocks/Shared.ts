export type BlocksParamType = string | number | boolean;

export interface Dictionary<Group> {
    [id: string]: Group,
}