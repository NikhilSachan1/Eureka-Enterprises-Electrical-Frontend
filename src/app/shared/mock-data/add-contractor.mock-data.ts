import {
  getRandomItem,
  TEST_INDIA_CITIES,
  TEST_INDIA_STATES,
} from './mock-data.constants';
import { IContractorAddFormDto } from '@features/site-management/contractor-management/types/contractor.dto';

export const ADD_CONTRACTOR_PREFILLED_DATA: IContractorAddFormDto = {
  contractorName: 'Test Contractor',
  contactNumber: 1234567890,
  emailAddress: 'test@example.com',
  contractorGSTNumber: '27aAACM3025E1ZZ',
  blockNumber: '123',
  streetName: 'Test Street',
  landmark: 'Test Landmark',
  state: getRandomItem(TEST_INDIA_STATES),
  city: getRandomItem(TEST_INDIA_CITIES),
  pincode: 123456,
};
