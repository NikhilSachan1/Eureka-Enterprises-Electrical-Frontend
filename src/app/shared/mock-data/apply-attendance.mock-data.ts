import { getRandomItemFromDropdown } from './mock-data.constants';
import {
  CLIENT_NAME_DATA,
  EMPLOYEE_NAME_DATA,
  LOCATION_DATA,
  VEHICLE_LIST_DATA,
} from '@shared/config/static-data.config';

export const APPLY_ATTENDANCE_PREFILLED_DATA: Record<string, unknown> = {
  locationName: getRandomItemFromDropdown(LOCATION_DATA),
  clientName: getRandomItemFromDropdown(CLIENT_NAME_DATA),
  associateEngineerName: getRandomItemFromDropdown(EMPLOYEE_NAME_DATA),
  associatedVehicle: getRandomItemFromDropdown(VEHICLE_LIST_DATA),
};
