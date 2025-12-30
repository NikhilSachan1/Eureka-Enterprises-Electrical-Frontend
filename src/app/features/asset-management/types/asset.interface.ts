import {
  IAssetDetailGetResponseDto,
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
