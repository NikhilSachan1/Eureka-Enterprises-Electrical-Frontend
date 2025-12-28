import {
  getRandomDate,
  getRandomItem,
  TEST_ATTENDANCE_STATUSES,
  TEST_EMPLOYEE_LIST,
  TEST_CLIENT_LIST,
  TEST_LOCATION_LIST,
  TEST_VEHICLE_LIST,
} from './mock-data.constants';

export const FORCE_ATTENDANCE_PREFILLED_DATA: Record<string, unknown> = {
  employeeName: [getRandomItem(TEST_EMPLOYEE_LIST)],
  date: getRandomDate(7, 3),
  attendanceStatus: getRandomItem(TEST_ATTENDANCE_STATUSES),
  forceReason: 'System regularization - Employee was on field duty',
  clientName: getRandomItem(TEST_CLIENT_LIST),
  locationName: getRandomItem(TEST_LOCATION_LIST),
  associateEngineerName: getRandomItem(TEST_EMPLOYEE_LIST),
  associatedVehicle: getRandomItem(TEST_VEHICLE_LIST),
};
