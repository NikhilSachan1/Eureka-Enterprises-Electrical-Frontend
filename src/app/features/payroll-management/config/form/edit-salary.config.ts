import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  EInputNumberMode,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { ISalaryEditFormDto } from '@features/payroll-management/types/payroll.dto';
import { APP_CONFIG } from '@core/config';

const EDIT_SALARY_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ISalaryEditFormDto> =
  {
    basicSalary: {
      id: 'basicSalary',
      fieldName: 'basicSalary',
      label: 'Basic Salary',
      fieldType: EDataType.NUMBER,
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required],
    },
    hra: {
      id: 'hra',
      fieldName: 'hra',
      label: 'HRA',
      fieldType: EDataType.NUMBER,
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required],
    },
    foodAllowance: {
      id: 'foodAllowance',
      fieldName: 'foodAllowance',
      label: 'Food Allowance',
      fieldType: EDataType.NUMBER,
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required],
    },
    tds: {
      id: 'tds',
      fieldName: 'tds',
      label: 'TDS',
      fieldType: EDataType.NUMBER,
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required],
    },
    employerEsicContribution: {
      id: 'employerEsicContribution',
      fieldName: 'employerEsicContribution',
      label: 'Employer ESIC Contribution',
      fieldType: EDataType.NUMBER,
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required],
    },
    employeePfContribution: {
      id: 'employeePfContribution',
      fieldName: 'employeePfContribution',
      label: 'Employee PF Contribution',
      fieldType: EDataType.NUMBER,
      numberConfig: {
        mode: EInputNumberMode.Currency,
        currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      validators: [Validators.required],
    },
    comments: {
      id: 'comments',
      fieldName: 'comments',
      label: 'Comments',
      fieldType: EDataType.TEXT_AREA,
      validators: [Validators.required],
    },
  };

const EDIT_SALARY_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Update Salary',
    tooltip: 'Update salary',
  },
};

export const EDIT_SALARY_FORM_CONFIG: IFormConfig<ISalaryEditFormDto> = {
  fields: EDIT_SALARY_FORM_FIELDS_CONFIG,
  buttons: EDIT_SALARY_FORM_BUTTONS_CONFIG,
};
