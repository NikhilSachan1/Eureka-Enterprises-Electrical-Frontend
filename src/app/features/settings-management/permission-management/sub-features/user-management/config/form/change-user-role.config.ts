import { Validators } from '@angular/forms';
import { IFormConfig, IFormInputFieldsConfig, EDataType } from '@shared/types';
import { IUserChangeRoleFormDto } from '../../types/user.dto';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';

const CHANGE_USER_ROLE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IUserChangeRoleFormDto> =
  {
    employeeRoles: {
      fieldType: EDataType.MULTI_SELECT,
      id: 'employeeRoles',
      fieldName: 'employeeRoles',
      label: 'Employee Roles',
      multiSelectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.COMMON,
          dropdownName: CONFIGURATION_KEYS.COMMON.ROLE_LIST,
        },
      },
      validators: [Validators.required],
    },
  };

export const CHANGE_USER_ROLE_FORM_CONFIG: IFormConfig<IUserChangeRoleFormDto> =
  {
    fields: CHANGE_USER_ROLE_FORM_FIELDS_CONFIG,
  };
