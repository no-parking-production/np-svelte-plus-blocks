import {ButtonAction} from "$lib/common/button/ButtonAction.js";
import {BlocksInterface} from "$lib/common/BlocksInterface.js";

export class BAGoToLocalBlock extends ButtonAction {
    private _currentValue: string | undefined;
    constructor(private readonly blockTargetPath: string) {
        super();
        const onGotoBlock = BlocksInterface.getInstance()?.onGotoBlock;
        onGotoBlock?.subscribe((path: string)=> {
            this._currentValue = path;
            super.setActive(path === blockTargetPath);
        });
    }
    onDown() {
        // nothing to do
    }
    onUp() {
        BlocksInterface.getInstance()?.gotoBlock(this.blockTargetPath);
    }
}