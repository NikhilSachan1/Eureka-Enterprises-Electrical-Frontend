import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { APPLY_LEAVE_FORM_CONFIG } from './apply-leave.config';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import { Validators } from '@angular/forms';
import { getPayslipCutoffMinDate } from '@shared/utility';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { ILeaveForceFormDto } from '@features/leave-management/types/leave.dto';

const {
  fields: { leaveDate, leaveReason },
} = APPLY_LEAVE_FORM_CONFIG;

const FORCE_LEAVE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ILeaveForceFormDto> =
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
    leaveReason,
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

export const FORCE_LEAVE_FORM_CONFIG: IFormConfig<ILeaveForceFormDto> = {
  fields: FORCE_LEAVE_FORM_FIELDS_CONFIG,
  buttons: FORCE_LEAVE_FORM_BUTTONS_CONFIG,
};
