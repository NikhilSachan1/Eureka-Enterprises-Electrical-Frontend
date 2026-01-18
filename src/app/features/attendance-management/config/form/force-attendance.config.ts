import { Validators } from '@angular/forms';
import { COMMON_FORM_ACTIONS } from '@shared/config';
import {
  EDataType,
  IFormButtonConfig,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { getPayslipCutoffMinDate } from '@shared/utility';
import { APPLY_ATTENDANCE_FORM_CONFIG } from './apply-attendance.config';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { IAttendanceForceFormDto } from '@features/attendance-management/types/attendance.dto';

const {
  fields: {
    clientName,
    locationName,
    associateEngineerName,
    associatedVehicle,
  },
} = APPLY_ATTENDANCE_FORM_CONFIG;

const FORCE_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAttendanceForceFormDto> =
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
    attendanceDate: {
      fieldType: EDataType.DATE,
      id: 'attendanceDate',
      fieldName: 'attendanceDate',
      label: 'Attendance Date',
      dateConfig: {
        minDate: getPayslipCutoffMinDate(),
        maxDate: new Date(),
      },
      validators: [Validators.required],
    },
    attendanceStatus: {
      fieldType: EDataType.SELECT,
      id: 'attendanceStatus',
      fieldName: 'attendanceStatus',
      label: 'Attendance Status',
      selectConfig: {
        haveFilter: false,
        dynamicDropdown: {
          moduleName: MODULE_NAMES.ATTENDANCE,
          dropdownName: CONFIGURATION_KEYS.ATTENDANCE.STATUS,
        },
        filterOptions: {
          exclude: [
            EAttendanceStatus.CHECKED_IN,
            EAttendanceStatus.CHECKED_OUT,
          ],
        },
      },
      validators: [Validators.required],
    },
    remark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remark',
      fieldName: 'remark',
      label: 'Note',
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

export const FORCE_ATTENDANCE_FORM_CONFIG: IFormConfig<IAttendanceForceFormDto> =
  {
    fields: FORCE_ATTENDANCE_FORM_FIELDS_CONFIG,
    buttons: FORCE_ATTENDANCE_FORM_BUTTONS_CONFIG,
  };
