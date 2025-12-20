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

const APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  approveReason: {
    fieldType: EDataType.TEXT_AREA,
    id: 'approveReason',
    fieldName: 'comment',
    label: 'Approve Reason',
  },
  rejectReason: {
    fieldType: EDataType.TEXT_AREA,
    id: 'rejectReason',
    fieldName: 'comment',
    label: 'Reject Reason',
    validators: [Validators.required],
  },
  cancelReason: {
    fieldType: EDataType.TEXT_AREA,
    id: 'cancelReason',
    fieldName: 'comment',
    label: 'Cancel Reason',
    validators: [Validators.required],
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
    validators: [Validators.required],
  },
};

export const APPROVAL_ACTION_LEAVE_FORM_CONFIG: IFormConfig = {
  fields: APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG,
};

export const getApprovalActionLeaveFormConfig = (
  dialogActionType: EButtonActionType,
  fromDate: Date
): IFormConfig => {
  if (dialogActionType === EButtonActionType.APPROVE) {
    const fields: IFormInputFieldsConfig = {
      approveReason: {
        ...APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG['approveReason'],
      },
    };

    return { fields };
  }

  if (dialogActionType === EButtonActionType.REJECT) {
    const fields: IFormInputFieldsConfig = {
      rejectReason: {
        ...APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG['rejectReason'],
      },
    };

    if (fromDate <= new Date()) {
      fields['attendanceStatus'] = {
        ...APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG['attendanceStatus'],
      };
    }

    return { fields };
  }

  if (dialogActionType === EButtonActionType.CANCEL) {
    const fields: IFormInputFieldsConfig = {
      cancelReason: {
        ...APPROVAL_ACTION_LEAVE_FORM_FIELDS_CONFIG['cancelReason'],
      },
    };

    return { fields };
  }

  return APPROVAL_ACTION_LEAVE_FORM_CONFIG;
};
