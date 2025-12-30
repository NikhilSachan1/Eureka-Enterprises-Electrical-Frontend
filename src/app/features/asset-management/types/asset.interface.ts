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
  > {
  originalRawData: IAssetGetBaseResponseDto;
}

export interface IAssetDetailResolverResponse
  extends IAssetDetailGetResponseDto {
  preloadedFiles?: File[];
}

export interface IAssetEventHistory
  extends Omit<
    IAssetEventHistoryGetBaseResponseDto,
    | 'createdAt'
    | 'createdBy'
    | 'updatedAt'
    | 'deletedAt'
    | 'updatedBy'
    | 'deletedBy'
    | 'assetMasterId'
    | 'assetFiles'
    | 'metadata'
    | 'fromUser'
    | 'toUser'
  > {
  remarks: string;
  originalRawData: IAssetEventHistoryGetBaseResponseDto;
}
