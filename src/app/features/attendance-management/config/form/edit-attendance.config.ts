import { IFormConfig } from '@shared/types';
import { IAttendanceEditUIFormDto } from '@features/attendance-management/types/attendance.dto';
import { FORCE_ATTENDANCE_FORM_CONFIG } from './force-attendance.config';

const {
  employeeName,
  attendanceDate,
  attendanceStatus,
  company,
  contractor,
  assignedEngineer,
  vehicle,
  remark,
} = FORCE_ATTENDANCE_FORM_CONFIG.fields;

export const EDIT_ATTENDANCE_FORM_CONFIG: IFormConfig<IAttendanceEditUIFormDto> =
  {
    fields: {
      employeeName: {
        ...employeeName,
        disabledInput: true,
      },
      attendanceDate: {
        ...attendanceDate,
        disabledInput: true,
      },
      attendanceStatus,
      company,
      contractor,
      assignedEngineer,
      vehicle,
      remark: {
        ...remark,
        label: 'Remark',
      },
    },
    buttons: {},
  };
