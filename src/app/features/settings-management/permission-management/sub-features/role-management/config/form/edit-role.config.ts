import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ADD_ROLE_FORM_CONFIG } from './add-role.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { IRoleEditFormDto } from '../../types/role.dto';

const EDIT_ROLE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IRoleEditFormDto> = {
  ...ADD_ROLE_FORM_CONFIG.fields,
  roleName: {
    ...ADD_ROLE_FORM_CONFIG.fields.roleName,
    disabledInput: true,
  },
};

const EDIT_ROLE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Role',
    tooltip: 'Update the role in the system',
  },
};

export const EDIT_ROLE_FORM_CONFIG: IFormConfig<IRoleEditFormDto> = {
  fields: EDIT_ROLE_FORM_FIELDS_CONFIG,
  buttons: EDIT_ROLE_FORM_BUTTONS_CONFIG,
};
