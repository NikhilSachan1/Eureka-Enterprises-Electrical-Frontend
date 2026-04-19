import { Validators } from '@angular/forms';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { shouldShowAttendanceStatusField } from '../../utils/leave.util';
import { CONFIGURATION_KEYS, MODULE_NAMES } from '@shared/constants';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { ILeaveActionUIFormDto } from '@features/leave-management/types/leave.dto';

const APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig<ILeaveActionUIFormDto> =
  {
    remark: {
      fieldType: EDataType.TEXT_AREA,
      id: 'remark',
      fieldName: 'remark',
      label: 'Reason',
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { actionType } = context;
            return (
              actionType === EButtonActionType.APPROVE ||
              actionType === EButtonActionType.REJECT ||
              actionType === EButtonActionType.CANCEL
            );
          },
          validators: [Validators.required],
        },
      ],
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
          include: [EAttendanceStatus.PRESENT, EAttendanceStatus.ABSENT],
        },
      },
      conditionalValidators: [
        {
          shouldApply: (context): boolean => {
            const { actionType, fromDate } = context;
            return shouldShowAttendanceStatusField(
              actionType as EButtonActionType,
              new Date(fromDate)
            );
          },
          validators: [Validators.required],
        },
      ],
    },
  };

export const APPROVAL_ACTION_LEAVE_FORM_CONFIG: IFormConfig<ILeaveActionUIFormDto> =
  {
    fields: APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG,
  };
