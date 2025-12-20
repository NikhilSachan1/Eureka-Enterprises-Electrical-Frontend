import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { APPLY_LEAVE_FORM_CONFIG } from './apply-leave.config';
import { COMMON_FORM_ACTIONS, EMPLOYEE_NAME_DATA } from '@shared/config';
import { Validators } from '@angular/forms';
import { getPayslipCutoffMinDate } from '@shared/utility';

const {
  fields: { leaveDate, description },
} = APPLY_LEAVE_FORM_CONFIG;

const FORCE_LEAVE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  employeeName: {
    fieldType: EDataType.SELECT,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    selectConfig: {
      optionsDropdown: EMPLOYEE_NAME_DATA,
    },
    validators: [Validators.required],
  },
  leaveDate: {
    ...leaveDate,
    dateConfig: {
      ...leaveDate.dateConfig,
      minDate: getPayslipCutoffMinDate(),
    },
  },
  description,
  approvalReason: {
    ...description,
  },
};

const FORCE_LEAVE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Force Leave',
    tooltip: 'Force leave',
  },
};

export const FORCE_LEAVE_FORM_CONFIG: IFormConfig = {
  fields: FORCE_LEAVE_FORM_FIELDS_CONFIG,
  buttons: FORCE_LEAVE_FORM_BUTTONS_CONFIG,
};
