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
  > {
  // Assigned user details - shows who currently has this asset
  assetAssigneeName: string | null;
  assetAssigneeCode: string | null;
  originalRawData: IAssetGetBaseResponseDto;
  assetDocuments: string[];
}

export interface IAssetDetailResolverResponse
  extends IAssetDetailGetResponseDto {
  preloadedFiles?: File[];
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
