import {
  IForgetPasswordFormDto,
  ILoginFormDto,
  IResetPasswordFormDto,
} from '@features/auth-management/types/auth.dto';
import { getRandomItem, TEST_LOGIN_EMAILS } from './mock-data.constants';

export const LOGIN_PREFILLED_DATA: ILoginFormDto = {
  email: getRandomItem(TEST_LOGIN_EMAILS),
  password: 'Admin@123',
  rememberMe: false,
};

export const FORGOT_PASSWORD_PREFILLED_DATA: IForgetPasswordFormDto = {
  email: getRandomItem(TEST_LOGIN_EMAILS),
};

export const RESET_PASSWORD_PREFILLED_DATA: IResetPasswordFormDto = {
  newPassword: 'Admin@123',
  confirmPassword: 'Admin@123',
};
