import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ISalaryIncrementAddFormDto } from '@features/payroll-management/types/payroll.dto';
import { EDIT_SALARY_FORM_CONFIG } from './edit-salary.config';

const ADD_SALARY_INCREMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ISalaryIncrementAddFormDto> =
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
          employeeStatusFilter: ['ACTIVE'],
        },
      },
      validators: [Validators.required],
    },
    incrementStartDate: {
      fieldType: EDataType.DATE,
      id: 'incrementStartDate',
      fieldName: 'incrementStartDate',
      label: 'Increment Effective From',
      dateConfig: {
        minDate: new Date(),
      },
      validators: [Validators.required],
    },

    ...EDIT_SALARY_FORM_CONFIG.fields,
  };

const ADD_SALARY_INCREMENT_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Add Salary Increment',
    tooltip: 'Add a new salary increment',
  },
};

export const ADD_SALARY_INCREMENT_FORM_CONFIG: IFormConfig<ISalaryIncrementAddFormDto> =
  {
    fields: ADD_SALARY_INCREMENT_FORM_FIELDS_CONFIG,
    buttons: ADD_SALARY_INCREMENT_FORM_BUTTONS_CONFIG,
  };
