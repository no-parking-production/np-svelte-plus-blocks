const MS_PER_S = 1000.0;
export abstract class AbstractIntervalScanner {
    private intervalWindow: Window;
    private syncInterval: number | undefined;
    protected constructor(topWindow: Window) {
        this.intervalWindow = topWindow;
    }
    public restartScanning(): void {
        this.stopScanning();
        this.startScanning();
    }
    public startScanning(): boolean {
        if (!this.syncInterval) {
            this.triggerScan();
            this.syncInterval = this.intervalWindow.setInterval(() => { this.scan() }, MS_PER_S / 4);
            return true;
        }
        return false;
    }
    public stopScanning(): void {
        if (this.syncInterval) {
            this.intervalWindow.clearInterval(this.syncInterval);
            this.syncInterval = undefined
        }
    }
    public triggerScan(): void {
        this.scan();
    }
    protected abstract scan(): void;
}