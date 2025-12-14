import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS, EMPLOYEE_NAME_DATA } from '@shared/config';
import {
  ATTENDANCE_STATUS_DATA,
  PAYSLIP_DATE_DATA,
} from '@shared/config/static-data.config';
import {
  EFieldType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import {
  filterOptionsByIncludeExclude,
  getPayslipCutoffMinDate,
} from '@shared/utility';
import { APPLY_ATTENDANCE_FORM_CONFIG } from './apply-attendance.config';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';

const {
  fields: {
    clientName,
    locationName,
    associateEngineerName,
    associatedVehicle,
  },
} = APPLY_ATTENDANCE_FORM_CONFIG;

const FORCE_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  employeeName: {
    fieldType: EFieldType.MultiSelect,
    id: 'employeeName',
    fieldName: 'employeeName',
    label: 'Employee Name',
    multiSelectConfig: {
      optionsDropdown: EMPLOYEE_NAME_DATA,
    },
    validators: [Validators.required],
  },
  date: {
    fieldType: EFieldType.Date,
    id: 'date',
    fieldName: 'date',
    label: 'Date',
    dateConfig: {
      minDate: getPayslipCutoffMinDate(PAYSLIP_DATE_DATA.EVERY_MONTH),
      maxDate: new Date(),
    },
    validators: [Validators.required],
  },
  attendanceStatus: {
    fieldType: EFieldType.Select,
    id: 'attendanceStatus',
    fieldName: 'attendanceStatus',
    label: 'Attendance Status',
    selectConfig: {
      haveFilter: false,
      optionsDropdown: filterOptionsByIncludeExclude(
        ATTENDANCE_STATUS_DATA,
        [],
        [EAttendanceStatus.CHECKED_IN, EAttendanceStatus.CHECKED_OUT]
      ),
    },
    validators: [Validators.required],
  },
  forceReason: {
    fieldType: EFieldType.TextArea,
    id: 'forceReason',
    fieldName: 'forceReason',
    label: 'Force Reason',
    validators: [Validators.required],
  },
  clientName,
  locationName,
  associateEngineerName,
  associatedVehicle,
};

const FORCE_ATTENDANCE_FORM_BUTTONS_CONFIG: IFormButtonConfig = {
  reset: {
    ...COMMON_FORM_ACTIONS.RESET,
  },
  submit: {
    ...COMMON_FORM_ACTIONS.SUBMIT,
    label: 'Force Attendance',
    tooltip: 'Force attendance for the selected employee',
  },
};

export const FORCE_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: FORCE_ATTENDANCE_FORM_FIELDS_CONFIG,
  buttons: FORCE_ATTENDANCE_FORM_BUTTONS_CONFIG,
};
