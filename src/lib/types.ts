import type { ButtonAction } from "$lib/common/button/ButtonAction.js";
import { BAction } from "$lib/common/button/BAction.js";

export { BAction };
export interface ButtonProps {
    label: string;
    primaryAction: ButtonAction;
    secondaryActions?: ButtonAction[];
}
 