import { IFormConfig, IFormInputFieldsConfig } from '@shared/types';
import { FORCE_ATTENDANCE_FORM_CONFIG } from './force-attendance.config';

const {
  fields: { attendanceStatus },
} = FORCE_ATTENDANCE_FORM_CONFIG;

const REGULARIZE_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  attendanceStatus,
};

export const REGULARIZE_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: REGULARIZE_ATTENDANCE_FORM_FIELDS_CONFIG,
};
