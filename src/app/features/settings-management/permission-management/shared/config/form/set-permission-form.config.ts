import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

export const ROLE_PERMISSION_FORM_SET_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Save Permissions',
    tooltip: 'Save permissions',
  },
};

export const ROLE_PERMISSION_FORM_SET_CONFIG: IFormConfig<
  Record<string, boolean>
> = {
  fields: {} as IFormInputFieldsConfig<Record<string, boolean>>,
  buttons: ROLE_PERMISSION_FORM_SET_BUTTONS_CONFIG,
};
