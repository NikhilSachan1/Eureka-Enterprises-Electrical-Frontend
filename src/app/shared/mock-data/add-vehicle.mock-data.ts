import {
  createFileFromAsset,
  getRandomDate,
  getRandomItem,
  getRandomNumber,
  TEST_VEHICLE_FUEL_TYPES,
} from './mock-data.constants';

export const ADD_VEHICLE_PREFILLED_DATA: Record<string, unknown> = {
  registrationNo: `MP${getRandomNumber(2, 'exact')}${getRandomNumber(2, 'exact')}${getRandomNumber(4, 'exact')}`,
  vehicleBrand: `Vehicle Brand ${getRandomNumber(2, 'upto')}`,
  vehicleModel: `Vehicle Model ${getRandomNumber(2, 'upto')}`,
  mileage: `${getRandomNumber(2, 'upto')}`,
  fuelType: getRandomItem(TEST_VEHICLE_FUEL_TYPES),
  vehiclePurchaseDate: getRandomDate(365 * 2, 365),
  dealerName: `Dealer Name ${getRandomNumber(2, 'upto')}`,
  insurancePeriod: [getRandomDate(365 * 2, 365), getRandomDate(365 * 1, 365)],
  pucPeriod: [getRandomDate(365 * 2, 365), getRandomDate(365 * 1, 365)],
  fitnessPeriod: [getRandomDate(365 * 2, 365), getRandomDate(365 * 1, 365)],
  vehicleDocuments: [
    createFileFromAsset('/mock-docs/vehicle/VEHICLE_DOCUMENT_1.pdf'),
    createFileFromAsset('/mock-docs/vehicle/VEHICLE_DOCUMENT_2.pdf'),
  ],
  remarks: 'Business vehicle for official work',
};
