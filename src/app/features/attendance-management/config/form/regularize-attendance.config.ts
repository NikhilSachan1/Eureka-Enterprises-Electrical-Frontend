import {
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
  IInputFieldsConfig,
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

function getAssignedDriverFieldConfig(
  multiple: boolean
): Partial<IInputFieldsConfig> {
  if (!multiple) {
    return assignedDriver;
  }

  return {
    ...assignedDriver,
    fieldType: EDataType.MULTI_SELECT,
    label: 'Assigned Drivers',
    selectConfig: undefined,
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
