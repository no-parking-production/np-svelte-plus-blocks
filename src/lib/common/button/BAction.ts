import type {BlocksParamType} from "$lib/common/interfaces/blocks/Shared.js";
import type {ButtonAction} from "$lib/common/button/ButtonAction.js";
import {BASetProperty} from "$lib/common/button/BASetProperty.js";
import {BAToggleProperty} from "$lib/common/button/BAToggleProperty.js";
import {BAToggleTags} from "$lib/common/button/BAToggleTags.js";
import {BASetTags} from "$lib/common/button/BASetTags.js";

export class BAction {
    public static SetProperty(propertyPath: string, value: BlocksParamType): ButtonAction {
        return new BASetProperty(propertyPath, value);
    }
    public static ToggleProperty(propertyPath: string, onValue: BlocksParamType, offValue: BlocksParamType): ButtonAction {
        return new BAToggleProperty(propertyPath, onValue, offValue);
    }
    public static SetTags(tags: string, ofSet: string = ''): ButtonAction {
        return new BASetTags(tags, ofSet);
    }
    public static ToggleTags(tags: string): ButtonAction {
        return new BAToggleTags(tags);
    }
}