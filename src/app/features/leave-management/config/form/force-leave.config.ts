import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';

import { FinancialYearService } from '@core/services/financial-year.service';
import { APPLY_LEAVE_FORM_CONFIG } from './apply-leave.config';
import { calculateMinEditableDate } from '@shared/utility';
import {
  EMPLOYEE_NAME_DATA,
  PAYSLIP_DATE_DATA,
} from '@shared/config/static-data.config';
import { EFieldType } from '@shared/types';
import { Validators } from '@angular/forms';
const financialYearService = new FinancialYearService();

const FORCE_LEAVE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  employeeName: {
    fieldType: EFieldType.Select,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    selectConfig: {
      optionsDropdown: EMPLOYEE_NAME_DATA,
    },
    validators: [Validators.required],
  },
  date: {
    ...APPLY_LEAVE_FORM_CONFIG.fields['date'],
    dateConfig: {
      ...APPLY_LEAVE_FORM_CONFIG.fields['date'].dateConfig,
      minDate: calculateMinEditableDate(PAYSLIP_DATE_DATA.EVERY_MONTH),
      maxDate: financialYearService.getFinancialYearEndDate(),
    },
  },
  reason: APPLY_LEAVE_FORM_CONFIG.fields['reason'],
};

const FORCE_LEAVE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Force Leave',
    tooltip: 'Force leave for the selected employee',
  },
};

export const FORCE_LEAVE_FORM_CONFIG: IFormConfig = {
  fields: FORCE_LEAVE_FORM_FIELDS_CONFIG,
  buttons: FORCE_LEAVE_FORM_BUTTONS_CONFIG,
};
