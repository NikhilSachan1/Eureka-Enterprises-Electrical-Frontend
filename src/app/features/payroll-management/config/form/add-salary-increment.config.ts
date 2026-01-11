import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const ADD_SALARY_INCREMENT_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
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
    },
    validators: [Validators.required],
  },
  basicSalary: {
    id: 'basicSalary',
    fieldName: 'basicSalary',
    label: 'Basic Salary',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  hra: {
    id: 'hra',
    fieldName: 'hra',
    label: 'HRA',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  foodAllowance: {
    id: 'foodAllowance',
    fieldName: 'foodAllowance',
    label: 'Food Allowance',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  tds: {
    id: 'tds',
    fieldName: 'tds',
    label: 'TDS',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  esicContribution: {
    id: 'esicContribution',
    fieldName: 'esicContribution',
    label: 'ESIC Contribution',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
  pfContribution: {
    id: 'pfContribution',
    fieldName: 'pfContribution',
    label: 'PF Contribution',
    fieldType: EDataType.NUMBER,
    validators: [Validators.required],
  },
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

export const ADD_SALARY_INCREMENT_FORM_CONFIG: IFormConfig = {
  fields: ADD_SALARY_INCREMENT_FORM_FIELDS_CONFIG,
  buttons: ADD_SALARY_INCREMENT_FORM_BUTTONS_CONFIG,
};
