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
import { ISalaryGrossUiFormField } from '@features/payroll-management/types/payroll.interface';
import { APP_CONFIG } from '@core/config';

const currencyFieldConfig = {
  fieldType: EDataType.NUMBER,
  numberConfig: {
    mode: EInputNumberMode.Currency,
    currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
  },
  validators: [Validators.required],
};

const EDIT_SALARY_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<
  ISalaryEditFormDto & ISalaryGrossUiFormField
> = {
  grossSalary: {
    id: 'grossSalary',
    fieldName: 'grossSalary',
    label: 'Gross Salary',
    fieldType: EDataType.NUMBER,
    numberConfig: {
      mode: EInputNumberMode.Currency,
      currency: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
    },
    validators: [Validators.required],
  },
  basicSalary: {
    id: 'basicSalary',
    fieldName: 'basicSalary',
    label: 'Basic Salary',
    ...currencyFieldConfig,
  },
  hra: {
    id: 'hra',
    fieldName: 'hra',
    label: 'HRA',
    ...currencyFieldConfig,
  },
  specialAllowance: {
    id: 'specialAllowance',
    fieldName: 'specialAllowance',
    label: 'Special Allowance',
    ...currencyFieldConfig,
  },
  foodAllowance: {
    id: 'foodAllowance',
    fieldName: 'foodAllowance',
    label: 'Monthly Fooding',
    ...currencyFieldConfig,
  },
  employerEsicContribution: {
    id: 'employerEsicContribution',
    fieldName: 'employerEsicContribution',
    label: 'ESIC',
    ...currencyFieldConfig,
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

export const EDIT_SALARY_FORM_CONFIG: IFormConfig<
  ISalaryEditFormDto & ISalaryGrossUiFormField
> = {
  fields: EDIT_SALARY_FORM_FIELDS_CONFIG,
  buttons: EDIT_SALARY_FORM_BUTTONS_CONFIG,
};
