export interface ISpotInfo {
    angle: number,
    brand?: string,
    cachedBlock?: any,
    canCacheBlock: boolean,
    compId: string,
    display?: string,
    factoryUniqueIdentifier: string,
    firstMac?: string,
    /*** Spot path */
    givenName: string,
    height: number,
    id: string,
    ipAddress?: string,
    macAddress?: string,
    model?: string,
    scaling: 'FillMaintainAspect' | 'Center' | 'TopLeft',
    /*** unique Blocks server ID */
    serverUUID: string,
    /*** Blocks server version */
    serverVersion: string,
    tags?: string,
    /*** Blocks Spot version */
    version: string,
    width: number,
}