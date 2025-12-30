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

export const ADD_ASSET_PREFILLED_DATA: Record<string, unknown> = {
  assetId: `EE-${getRandomNumber(7, 'upto')}`,
  assetName: `Asset Name ${getRandomNumber(2, 'upto')}`,
  assetModel: `Asset Model ${getRandomNumber(2, 'upto')}`,
  assetSerialNumber: `SERIAL${getRandomNumber(10, 'upto')}`,
  assetCategory: getRandomItem(TEST_ASSET_CATEGORIES),
  assetType: getRandomItem(TEST_ASSET_TYPES),
  calibrationFrom: getRandomItem(TEST_CALIBRATION_SOURCES),
  calibrationFrequency: getRandomItem(TEST_CALIBRATION_FREQUENCIES),
  calibrationPeriod: [getRandomDate(365 * 2, 365), getRandomDate(365 * 1, 365)],
  assetPurchaseDate: getRandomDate(365 * 2, 365),
  vendorName: `Vendor Name ${getRandomNumber(2, 'upto')}`,
  warrantyPeriod: [getRandomDate(365 * 2, 365), getRandomDate(365 * 1, 365)],
  assetImages: [
    createFileFromAsset('/mock-docs/asset/ASSET_IMAGE_1.png'),
    createFileFromAsset('/mock-docs/asset/ASSET_IMAGE_2.png'),
  ],
  assetDocuments: [
    createFileFromAsset('/mock-docs/asset/ASSET_DOCUMENT_1.pdf'),
    createFileFromAsset('/mock-docs/asset/ASSET_DOCUMENT_2.pdf'),
  ],
  remarks: 'Business asset for official work',
};
