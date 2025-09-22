import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EDateSelectionMode, EFieldType } from '@shared/types';

import { FinancialYearService } from '@core/services/financial-year.service';
const financialYearService = new FinancialYearService();

const APPLY_LEAVE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  date: {
    fieldType: EFieldType.Date,
    id: 'date',
    fieldName: 'date',
    label: 'Date',
    dateConfig: {
      minDate: new Date(),
      maxDate: financialYearService.getFinancialYearEndDate(),
      selectionMode: EDateSelectionMode.Range,
    },
    validators: [Validators.required],
  },
  reason: {
    fieldType: EFieldType.TextArea,
    id: 'reason',
    fieldName: 'reason',
    label: 'Reason',
    validators: [Validators.required],
  },
};

const APPLY_LEAVE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Apply Leave',
    tooltip: 'Apply leave for the selected employee',
  },
};

export const APPLY_LEAVE_FORM_CONFIG: IFormConfig = {
  fields: APPLY_LEAVE_FORM_FIELDS_CONFIG,
  buttons: APPLY_LEAVE_FORM_BUTTONS_CONFIG,
};
