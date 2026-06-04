export type BlocksParamType = string | number | boolean;

export type BlocksParamPath = string;

export interface Dictionary<Group> {
    [id: string]: Group,
}