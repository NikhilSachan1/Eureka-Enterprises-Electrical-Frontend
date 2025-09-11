import { Validators } from '@angular/forms';
import {
  CLIENT_NAME_DATA,
  COMMON_FORM_ACTIONS,
  EMPLOYEE_NAME_DATA,
  LOCATION_DATA,
} from '@shared/config';
import {
  ATTENDANCE_STATUS_DATA,
  PAYSLIP_DATE_DATA,
} from '@shared/config/static-data.config';
import {
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/models';
import { EFieldType } from '@shared/types';
import { calculateMinEditableDate } from '@shared/utility';

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
      minDate: calculateMinEditableDate(PAYSLIP_DATE_DATA.EVERY_MONTH),
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
      optionsDropdown: ATTENDANCE_STATUS_DATA,
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
  clientName: {
    fieldType: EFieldType.Select,
    id: 'clientName',
    fieldName: 'clientName',
    label: 'Client Name',
    selectConfig: {
      optionsDropdown: CLIENT_NAME_DATA,
    },
    validators: [Validators.required],
  },
  location: {
    fieldType: EFieldType.Select,
    id: 'location',
    fieldName: 'location',
    label: 'Location',
    selectConfig: {
      optionsDropdown: LOCATION_DATA,
    },
    validators: [Validators.required],
  },
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
