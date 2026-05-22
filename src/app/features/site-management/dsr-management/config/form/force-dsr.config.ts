import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { IDsrForceUIFormDto } from '@features/site-management/dsr-management/types/dsr.dto';
import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ADD_DSR_FORM_CONFIG } from './add-dsr.config';

const FORCE_DSR_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IDsrForceUIFormDto> =
  {
    employeeName: {
      fieldType: EDataType.SELECT,
      id: 'employeeName',
      fieldName: 'employeeName',
      label: 'Employee Name',
      selectConfig: {
        dynamicDropdown: {
          moduleName: MODULE_NAMES.EMPLOYEE,
          dropdownName: CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST,
        },
        dependentDropdown: {
          dependsOnField: 'projectName',
          dependsOnFieldLabel: 'a project',
        },
      },
      validators: [Validators.required],
    },
    ...ADD_DSR_FORM_CONFIG.fields,
  };

const FORCE_DSR_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Force DSR',
    tooltip: 'Add DSR on behalf of the selected employee',
  },
};

export const FORCE_DSR_FORM_CONFIG: IFormConfig<IDsrForceUIFormDto> = {
  fields: FORCE_DSR_FORM_FIELDS_CONFIG,
  buttons: FORCE_DSR_FORM_BUTTONS_CONFIG,
};
