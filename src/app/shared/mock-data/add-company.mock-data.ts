import { ICompanyAddFormDto } from '@features/site-management/company-management/types/company.dto';
import { getRandomItem, TEST_INDIA_STATES } from './mock-data.constants';

export const ADD_COMPANY_PREFILLED_DATA: ICompanyAddFormDto = {
  companyName: 'Test Company',
  contactNumber: 1234567890,
  emailAddress: 'test@example.com',
  companyGSTNumber: '27aAACM3025E1ZZ',
  blockNumber: '123',
  streetName: 'Test Street',
  landmark: 'Test Landmark',
  state: getRandomItem(TEST_INDIA_STATES),
  city: 'Test City',
  pincode: 123456,
  parentCompanyName: null,
};
