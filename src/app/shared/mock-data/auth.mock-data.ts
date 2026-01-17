import { getRandomItem, TEST_LOGIN_EMAILS } from './mock-data.constants';

export const LOGIN_PREFILLED_DATA: Record<string, unknown> = {
  email: getRandomItem(TEST_LOGIN_EMAILS),
  password: 'Admin@123',
};

export const FORGOT_PASSWORD_PREFILLED_DATA: Record<string, unknown> = {
  email: getRandomItem(TEST_LOGIN_EMAILS),
};

export const RESET_PASSWORD_PREFILLED_DATA: Record<string, unknown> = {
  newPassword: 'Admin@123',
  confirmPassword: 'Admin@123',
};
