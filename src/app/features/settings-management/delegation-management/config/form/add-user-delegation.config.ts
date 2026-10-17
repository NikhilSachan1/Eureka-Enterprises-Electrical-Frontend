import { Validators } from '@angular/forms';
import { IUserDelegationAddFormDto } from '@features/settings-management/delegation-management/types/user-delegation.dto';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ADD_USER_DELEGATION_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IUserDelegationAddFormDto> =
  {
    managerName: {
      fieldType: EDataType.SELECT,
      id: 'managerName',
      fieldName: 'managerName',
      label: 'Manager',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          employeeStatusFilter: ['ACTIVE'],
        },
        showClearButton: true,
      },
      validators: [Validators.required],
    },
    memberName: {
      fieldType: EDataType.SELECT,
      id: 'memberName',
      fieldName: 'memberName',
      label: 'Member',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
          employeeStatusFilter: ['ACTIVE'],
        },
        showClearButton: true,
      },
      validators: [Validators.required],
    },
    module: {
      fieldType: EDataType.SELECT,
      id: 'module',
      fieldName: 'module',
      label: 'Module',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PERMISSION,
          dropdownName: CONFIGURATION_KEYS.PERMISSION.MODULE_CONFIG_DROPDOWN,
        },
        showClearButton: false,
      },
      validators: [Validators.required],
    },
  };

export const ADD_USER_DELEGATION_FORM_CONFIG: IFormConfig<IUserDelegationAddFormDto> =
  {
    fields: ADD_USER_DELEGATION_FORM_FIELDS_CONFIG,
  };
