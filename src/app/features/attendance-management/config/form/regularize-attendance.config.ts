import { Validators } from '@angular/forms';
import { CLIENT_NAME_DATA, LOCATION_DATA } from '@shared/config';
import { ATTENDANCE_STATUS_DATA } from '@shared/config/static-data.config';
import { EFieldType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { filterOptionsByIncludeExclude } from '@shared/utility';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';

const REGULARIZE_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
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
        ['checked_in', 'checked_out']
      ),
    },
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
    conditionalValidators: [
      {
        dependsOn: 'attendanceStatus',
        validators: [Validators.required],
        shouldApply: (value: unknown): boolean =>
          value === EAttendanceStatus.PRESENT,
        resetOnFalse: true,
      },
    ],
  },
  location: {
    fieldType: EFieldType.Select,
    id: 'location',
    fieldName: 'location',
    label: 'Location',
    selectConfig: {
      optionsDropdown: LOCATION_DATA,
    },
    conditionalValidators: [
      {
        dependsOn: 'attendanceStatus',
        validators: [Validators.required],
        shouldApply: (value: unknown): boolean =>
          value === EAttendanceStatus.PRESENT,
        resetOnFalse: true,
      },
    ],
  },
};

export const REGULARIZE_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: REGULARIZE_ATTENDANCE_FORM_FIELDS_CONFIG,
};
