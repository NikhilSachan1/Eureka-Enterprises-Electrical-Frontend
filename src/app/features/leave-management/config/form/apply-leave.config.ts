import { Validators } from '@angular/forms';
import { FinancialYearService } from '@core/services/financial-year.service';
import { ILeaveApplyFormDto } from '@features/leave-management/types/leave.dto';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  EDateSelectionMode,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';

const APPLY_LEAVE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ILeaveApplyFormDto> =
  {
    leaveDate: {
      fieldType: EDataType.DATE,
      id: 'leaveDate',
      fieldName: 'leaveDate',
      label: 'Leave Period',
      dateConfig: {
        selectionMode: EDateSelectionMode.Range,
        minDate: new Date(),
        maxDate: new FinancialYearService().getFinancialYearEndDate(),
      },
      validators: [Validators.required],
    },

    leaveReason: {
      fieldType: EDataType.TEXT_AREA,
      id: 'leaveReason',
      fieldName: 'leaveReason',
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

export const APPLY_LEAVE_FORM_CONFIG: IFormConfig<ILeaveApplyFormDto> = {
  fields: APPLY_LEAVE_FORM_FIELDS_CONFIG,
  buttons: APPLY_LEAVE_FORM_BUTTONS_CONFIG,
};
