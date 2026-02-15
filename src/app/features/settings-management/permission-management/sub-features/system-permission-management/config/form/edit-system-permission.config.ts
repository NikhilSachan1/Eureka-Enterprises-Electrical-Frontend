import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ADD_SYSTEM_PERMISSION_FORM_CONFIG } from './add-system-permission.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { ISystemPermissionEditFormDto } from '../../types/system-permission.dto';

const EDIT_SYSTEM_PERMISSION_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ISystemPermissionEditFormDto> =
  {
    ...ADD_SYSTEM_PERMISSION_FORM_CONFIG.fields,
    moduleName: {
      ...ADD_SYSTEM_PERMISSION_FORM_CONFIG.fields.moduleName,
      disabledInput: true,
    },
    moduleAction: {
      ...ADD_SYSTEM_PERMISSION_FORM_CONFIG.fields.moduleAction,
      disabledInput: true,
    },
  };

const EDIT_SYSTEM_PERMISSION_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Permission',
    tooltip: 'Update the permission in the system',
  },
};

export const EDIT_SYSTEM_PERMISSION_FORM_CONFIG: IFormConfig<ISystemPermissionEditFormDto> =
  {
    fields: EDIT_SYSTEM_PERMISSION_FORM_FIELDS_CONFIG,
    buttons: EDIT_SYSTEM_PERMISSION_FORM_BUTTONS_CONFIG,
  };
