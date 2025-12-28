import {
  getRandomItemFromDropdown,
  getRandomDate,
  getRandomItem,
  TEST_ATTENDANCE_STATUSES,
} from './mock-data.constants';
import {
  CLIENT_NAME_DATA,
  EMPLOYEE_NAME_DATA,
  LOCATION_DATA,
  VEHICLE_LIST_DATA,
} from '@shared/config/static-data.config';

export const FORCE_ATTENDANCE_PREFILLED_DATA: Record<string, unknown> = {
  employeeName: [getRandomItemFromDropdown(EMPLOYEE_NAME_DATA)],
  date: getRandomDate(7, 3),
  attendanceStatus: getRandomItem(TEST_ATTENDANCE_STATUSES),
  forceReason: 'System regularization - Employee was on field duty',
  clientName: getRandomItemFromDropdown(CLIENT_NAME_DATA),
  locationName: getRandomItemFromDropdown(LOCATION_DATA),
  associateEngineerName: getRandomItemFromDropdown(EMPLOYEE_NAME_DATA),
  associatedVehicle: getRandomItemFromDropdown(VEHICLE_LIST_DATA),
};
