import {
  IAssetDetailGetResponseDto,
  IAssetEventHistoryGetBaseResponseDto,
  IAssetGetBaseResponseDto,
} from './asset.dto';

export interface IAsset
  extends Omit<
    IAssetGetBaseResponseDto,
    | 'model'
    | 'serialNumber'
    | 'assetType'
    | 'calibrationFrequency'
    | 'calibrationStartDate'
    | 'calibrationEndDate'
    | 'purchaseDate'
    | 'vendorName'
    | 'warrantyStartDate'
    | 'warrantyEndDate'
    | 'additionalData'
    | 'remarks'
    | 'assignedTo'
    | 'assignedToUser'
    | 'createdAt'
    | 'updatedAt'
    | 'documentKeys'
    | 'calibrationDocumentKeys'
  > {
  // Assigned user details - shows who currently has this asset
  assetAssigneeName: string | null;
  assetAssigneeCode: string | null;
  originalRawData: IAssetGetBaseResponseDto;
  assetDocuments: string[];
  calibrationDocuments: string[];
}

export interface IAssetDetailResolverResponse
  extends IAssetDetailGetResponseDto {
  preloadedFiles?: File[];
  preloadedCalibrationFiles?: File[];
}

export interface IAssetEventHistory
  extends Omit<
    IAssetEventHistoryGetBaseResponseDto,
    | 'assetMasterId'
    | 'fromUserId'
    | 'toUserId'
    | 'updatedAt'
    | 'asset'
    | 'metadata'
    | 'id'
    | 'createdById'
    | 'createdByUser'
    | 'fromUserDetails'
    | 'toUserDetails'
  > {
  remarks: string;
  /** Raw event type (e.g. LOST); `eventType` holds the display label. */
  eventTypeCode: string;
  lossDetails: IAssetLossDetails | null;
  // From User - who transferred the asset
  fromUserName: string | null;
  fromUserCode: string | null;
  // To User - who received the asset
  toUserName: string | null;
  toUserCode: string | null;
  // Created By - who created this event
  createdByName: string;
  createdByCode: string;
}

/** What was recorded when an asset was marked lost or recovered (from the event metadata). */
export interface IAssetLossDetails {
  reason: string | null;
  /** Charged to the previous assignee when marked lost. */
  recoveryAmount: number | null;
  /** Credited back to them when recovered. */
  refundedAmount: number | null;
}
