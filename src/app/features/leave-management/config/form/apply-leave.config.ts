import { Validators } from '@angular/forms';
import { FinancialYearService } from '@core/services/financial-year.service';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  EDateSelectionMode,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const APPLY_LEAVE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  leaveDate: {
    fieldType: EDataType.DATE,
    id: 'leaveDate',
    fieldName: 'leaveDate',
    label: 'Date of Leaves',
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
      minDate: new Date(),
      maxDate: new FinancialYearService().getFinancialYearEndDate(),
    },
    validators: [Validators.required],
  },

  description: {
    fieldType: EDataType.TEXT_AREA,
    id: 'description',
    fieldName: 'description',
    label: 'Reason for Leave',
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
    tooltip: 'Apply for a new leave',
  },
};

export const APPLY_LEAVE_FORM_CONFIG: IFormConfig = {
  fields: APPLY_LEAVE_FORM_FIELDS_CONFIG,
  buttons: APPLY_LEAVE_FORM_BUTTONS_CONFIG,
};
