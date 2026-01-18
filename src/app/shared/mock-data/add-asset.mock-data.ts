import { IAssetAddFormDto } from '@features/asset-management/types/asset.dto';
import {
  getRandomItem,
  createFileFromAsset,
  getRandomNumber,
  TEST_CALIBRATION_FREQUENCIES,
  TEST_CALIBRATION_SOURCES,
  TEST_ASSET_CATEGORIES,
  TEST_ASSET_TYPES,
  getRandomDate,
} from './mock-data.constants';

export const ADD_ASSET_PREFILLED_DATA: IAssetAddFormDto = {
  assetId: `EE-${getRandomNumber(7, 'upto')}`,
  assetName: `Asset Name ${getRandomNumber(2, 'upto')}`,
  assetModel: `Asset Model ${getRandomNumber(2, 'upto')}`,
  assetSerialNumber: `SERIAL${getRandomNumber(10, 'upto')}`,
  assetCategory: getRandomItem(TEST_ASSET_CATEGORIES),
  assetType: getRandomItem(TEST_ASSET_TYPES),
  assetCalibrationFrom: getRandomItem(TEST_CALIBRATION_SOURCES),
  assetCalibrationFrequency: getRandomItem(TEST_CALIBRATION_FREQUENCIES),
  assetCalibrationDate: [
    getRandomDate(365 * 2, 365),
    getRandomDate(365 * 1, 365),
  ],
  assetPurchaseDate: getRandomDate(365 * 2, 365),
  assetVendorName: `Vendor Name ${getRandomNumber(2, 'upto')}`,
  assetWarrantyDate: [getRandomDate(365 * 2, 365), getRandomDate(365 * 1, 365)],
  assetFiles: [
    createFileFromAsset('/mock-docs/asset/ASSET_IMAGE_1.png'),
    createFileFromAsset('/mock-docs/asset/ASSET_IMAGE_2.png'),
  ],
  remarks: 'Business asset for official work',
};
