import type { ButtonAction } from "$lib/common/button/ButtonAction.js";

export interface ButtonProps {
    label: string;
    primaryAction: ButtonAction;
    secondaryActions?: ButtonAction[];
}
 