import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { FORCE_ATTENDANCE_FORM_CONFIG } from './force-attendance.config';
import { IAttendanceRegularizedUIFormDto } from '@features/attendance-management/types/attendance.dto';

const {
  fields: {
    attendanceStatus,
    company,
    contractor,
    assignedEngineer,
    assignedDriver,
    vehicle,
  },
} = FORCE_ATTENDANCE_FORM_CONFIG;

const REGULARIZE_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<IAttendanceRegularizedUIFormDto> =
  {
    attendanceStatus,
    company,
    contractor,
    assignedEngineer,
    assignedDriver,
    vehicle,
  };

export const REGULARIZE_ATTENDANCE_FORM_CONFIG: IFormConfig<IAttendanceRegularizedUIFormDto> =
  {
    fields: REGULARIZE_ATTENDANCE_FORM_FIELDS_CONFIG,
  };
