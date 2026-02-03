import {
  getRandomDate,
  getRandomItem,
  getRandomNumber,
  TEST_COMPANY_NAMES,
  TEST_CONTRACTOR_NAMES,
  TEST_EMPLOYEE_NAMES,
  TEST_INDIA_CITIES,
  TEST_INDIA_STATES,
  TEST_LANDMARKS,
  TEST_PROJECT_NAMES,
  TEST_PROJECT_WORK_TYPES,
  TEST_STREET_NAMES,
} from './mock-data.constants';
import { IProjectAddFormDto } from '@features/site-management/project-management/types/project.dto';

export const ADD_PROJECT_PREFILLED_DATA: IProjectAddFormDto = {
  projectName: getRandomItem(TEST_PROJECT_NAMES),
  companyName: getRandomItem(TEST_COMPANY_NAMES),
  contractorNames: [getRandomItem(TEST_CONTRACTOR_NAMES)],
  siteManagerName: getRandomItem(TEST_EMPLOYEE_NAMES),
  siteManagerContact: `${getRandomNumber(10, 'exact')}`,
  timeline: [getRandomDate(365 * 2, 365), getRandomDate(365 * 1, 365)],
  baseDistanceKm: getRandomNumber(2, 'exact'),
  estimatedBudget: getRandomNumber(10, 'exact'),
  blockNumber: `${getRandomNumber(10, 'exact')}`,
  streetName: getRandomItem(TEST_STREET_NAMES),
  landmark: getRandomItem(TEST_LANDMARKS),
  state: getRandomItem(TEST_INDIA_STATES),
  city: getRandomItem(TEST_INDIA_CITIES),
  pincode: `${getRandomNumber(6, 'exact')}`,
  workTypes: [getRandomItem(TEST_PROJECT_WORK_TYPES)],
  remarks: 'Business project for official work',
};
