import { PathStore } from "./PathStore.ts";
import { browser } from "$app/environment";

export const localCache = browser ? new PathStore("gesundheit-sync") : null;