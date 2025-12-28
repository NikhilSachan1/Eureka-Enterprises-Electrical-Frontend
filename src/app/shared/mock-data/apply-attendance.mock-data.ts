import {
  getRandomItem,
  TEST_EMPLOYEE_LIST,
  TEST_CLIENT_LIST,
  TEST_LOCATION_LIST,
  TEST_VEHICLE_LIST,
} from './mock-data.constants';

export const APPLY_ATTENDANCE_PREFILLED_DATA: Record<string, unknown> = {
  locationName: getRandomItem(TEST_LOCATION_LIST),
  clientName: getRandomItem(TEST_CLIENT_LIST),
  associateEngineerName: getRandomItem(TEST_EMPLOYEE_LIST),
  associatedVehicle: getRandomItem(TEST_VEHICLE_LIST),
};
