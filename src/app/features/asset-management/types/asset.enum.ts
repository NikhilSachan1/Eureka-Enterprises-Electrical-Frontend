export enum EAssetType {
  CALIBRATED = 'CALIBRATED',
  NON_CALIBRATED = 'NON_CALIBRATED',
}

export enum EAssetStatus {
  ASSIGNED = 'ASSIGNED',
  LOST = 'LOST',
  RETIRED = 'RETIRED',
}

/** Asset list tab: assigned to you, every asset, or handover still pending. */
export enum EAssetScope {
  MY = 'MY',
  ALL = 'ALL',
  PENDING = 'PENDING',
}
