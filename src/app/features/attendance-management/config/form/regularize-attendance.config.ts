import { Validators } from '@angular/forms';
import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { APPLY_ATTENDANCE_FORM_CONFIG } from './apply-attendance.config';
import { FORCE_ATTENDANCE_FORM_CONFIG } from './force-attendance.config';

const REGULARIZE_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  attendanceStatus: FORCE_ATTENDANCE_FORM_CONFIG.fields['attendanceStatus'],
  clientName: {
    ...APPLY_ATTENDANCE_FORM_CONFIG.fields['clientName'],
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
  locationName: {
    ...APPLY_ATTENDANCE_FORM_CONFIG.fields['locationName'],
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
  associateEngineerName:
    APPLY_ATTENDANCE_FORM_CONFIG.fields['associateEngineerName'],
  associatedVehicle: APPLY_ATTENDANCE_FORM_CONFIG.fields['associatedVehicle'],
};

export const REGULARIZE_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: REGULARIZE_ATTENDANCE_FORM_FIELDS_CONFIG,
};
