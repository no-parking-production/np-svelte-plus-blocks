import {AbstractIntervalScanner} from "$lib/common/blocks_interface/same_origin/AbstractIntervalScanner.js";


export class ScannerGroup extends AbstractIntervalScanner {
    private scanners: AbstractIntervalScanner[];
    constructor(topWindow: Window, scanners: AbstractIntervalScanner[]) {
        super(topWindow);
        this.scanners = scanners;
    }
    protected scan() {
        this.scanners.forEach((scanner)=>scanner.triggerScan());
    }
}