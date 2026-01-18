import { IvehicleAddFormDto } from '@features/transport-management/vehicle-management/types/vehicle.dto';
import {
  createFileFromAsset,
  getRandomDate,
  getRandomItem,
  getRandomNumber,
  TEST_VEHICLE_FUEL_TYPES,
} from './mock-data.constants';

export const ADD_VEHICLE_PREFILLED_DATA: IvehicleAddFormDto = {
  vehicleRegistrationNo: `MP${getRandomNumber(2, 'exact')}${getRandomNumber(2, 'exact')}${getRandomNumber(4, 'exact')}`,
  vehicleBrand: `Vehicle Brand ${getRandomNumber(2, 'upto')}`,
  vehicleModel: `Vehicle Model ${getRandomNumber(2, 'upto')}`,
  vehicleMileage: `${getRandomNumber(2, 'upto')}`,
  vehicleFuelType: getRandomItem(TEST_VEHICLE_FUEL_TYPES),
  vehiclePurchaseDate: getRandomDate(365 * 2, 365),
  vehicleDealerName: `Dealer Name ${getRandomNumber(2, 'upto')}`,
  vehicleInsuranceDate: [
    getRandomDate(365 * 2, 365),
    getRandomDate(365 * 1, 365),
  ],
  vehiclePUCDate: [getRandomDate(365 * 2, 365), getRandomDate(365 * 1, 365)],
  vehicleFitnessDate: [
    getRandomDate(365 * 2, 365),
    getRandomDate(365 * 1, 365),
  ],
  vehicleFiles: [
    createFileFromAsset('/mock-docs/vehicle/VEHICLE_DOCUMENT_1.pdf'),
    createFileFromAsset('/mock-docs/vehicle/VEHICLE_DOCUMENT_2.pdf'),
  ],
  remarks: 'Business vehicle for official work',
};
