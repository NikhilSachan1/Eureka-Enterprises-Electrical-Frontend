import {
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { FORCE_ATTENDANCE_FORM_CONFIG } from './force-attendance.config';
import { IAttendanceRegularizedUIFormDto } from '@features/attendance-management/types/attendance.dto';

const {
  fields: {
    attendanceStatus,
    company,
    contractor,
    assignedDriver,
    vehicle,
  },
} = FORCE_ATTENDANCE_FORM_CONFIG;

function getAssignedDriverFieldConfig(multiple: boolean) {
  if (!multiple) {
    return assignedDriver;
  }

  return {
    fieldType: EDataType.MULTI_SELECT,
    id: 'assignedDriver',
    fieldName: 'assignedDriver',
    label: 'Assigned Drivers',
    multiSelectConfig: {
      dynamicDropdown: assignedDriver.selectConfig?.dynamicDropdown,
    },
  };
}

export function getRegularizeAttendanceFormConfig(
  assignedDriverMultiple = false
): IFormConfig<IAttendanceRegularizedUIFormDto> {
  const fields: IFormInputFieldsConfig<IAttendanceRegularizedUIFormDto> = {
    attendanceStatus,
    company,
    contractor,
    assignedDriver: getAssignedDriverFieldConfig(assignedDriverMultiple),
    vehicle,
  };

  return { fields };
}

export const REGULARIZE_ATTENDANCE_FORM_CONFIG =
  getRegularizeAttendanceFormConfig();
