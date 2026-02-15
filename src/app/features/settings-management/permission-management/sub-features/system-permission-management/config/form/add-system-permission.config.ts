import { Validators } from '@angular/forms';
import {
  IFormConfig,
  IFormInputFieldsConfig,
  IFormButtonConfig,
  EDataType,
} from '@shared/types';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { ISystemPermissionAddFormDto } from '../../types/system-permission.dto';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';

const ADD_SYSTEM_PERMISSION_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ISystemPermissionAddFormDto> =
  {
    moduleName: {
      fieldType: EDataType.SELECT,
      id: 'moduleName',
      fieldName: 'moduleName',
      label: 'Module Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.PERMISSION,
          dropdownName: CONFIGURATION_KEYS.PERMISSION.MODULE_NAMES,
        },
      },
      validators: [Validators.required],
    },
    moduleAction: {
      fieldType: EDataType.SELECT,
      id: 'moduleAction',
      fieldName: 'moduleAction',
      label: 'Module Action',
      selectConfig: {
        dependentDropdown: {
          dependsOnField: 'moduleName',
          optionsProviderMethod: 'getModuleActionsByModuleName',
        },
      },
      validators: [Validators.required],
    },
    permissionDescription: {
      fieldType: EDataType.TEXT_AREA,
      id: 'permissionDescription',
      fieldName: 'permissionDescription',
      label: 'Permission Description',
      validators: [Validators.required, Validators.minLength(10)],
    },
  };

const ADD_SYSTEM_PERMISSION_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Permission',
    tooltip: 'Add a new permission to the system',
  },
};

export const ADD_SYSTEM_PERMISSION_FORM_CONFIG: IFormConfig<ISystemPermissionAddFormDto> =
  {
    fields: ADD_SYSTEM_PERMISSION_FORM_FIELDS_CONFIG,
    buttons: ADD_SYSTEM_PERMISSION_FORM_BUTTONS_CONFIG,
  };
