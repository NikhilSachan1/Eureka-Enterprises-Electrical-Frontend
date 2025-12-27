import { Validators } from '@angular/forms';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { ATTENDANCE_STATUS_DATA } from '@shared/config/static-data.config';
import {
  EButtonActionType,
  EDataType,
  IFormConfig,
  IFormInputFieldsConfig,
} from '@shared/types';
import { filterOptionsByIncludeExclude } from '@shared/utility';
import { shouldShowAttendanceStatusField } from '../../utils/leave.util';

const APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  comment: {
    fieldType: EDataType.TEXT_AREA,
    id: 'comment',
    fieldName: 'comment',
    label: 'Comment',
    conditionalValidators: [
      {
        shouldApply: (context): boolean => {
          const { actionType } = context;
          return (
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
      optionsDropdown: filterOptionsByIncludeExclude(ATTENDANCE_STATUS_DATA, [
        EAttendanceStatus.ABSENT,
        EAttendanceStatus.PRESENT,
      ]),
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

export const APPROVAL_ACTION_LEAVE_FORM_CONFIG: IFormConfig = {
  fields: APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG,
};
