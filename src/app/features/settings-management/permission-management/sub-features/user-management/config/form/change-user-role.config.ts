import { Validators } from '@angular/forms';
import { IFormConfig, IFormInputFieldsConfig, EDataType } from '@shared/types';
import { IEmployeeChangeRoleFormDto } from '@features/employee-management/types/employee.dto';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';

const CHANGE_USER_ROLE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IEmployeeChangeRoleFormDto> =
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

export const CHANGE_USER_ROLE_FORM_CONFIG: IFormConfig<IEmployeeChangeRoleFormDto> =
  {
    fields: CHANGE_USER_ROLE_FORM_FIELDS_CONFIG,
  };
