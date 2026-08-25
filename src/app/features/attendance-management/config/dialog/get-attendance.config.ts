import { ApprovalAttendanceComponent } from '@features/attendance-management/components/approval-attendance/approval-attendance.component';
import { DeleteAttendanceComponent } from '@features/attendance-management/components/delete-attendance/delete-attendance.component';
import { RegularizeAttendanceComponent } from '@features/attendance-management/components/regularize-attendance/regularize-attendance.component';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';
import { EButtonActionType, EDialogSize, IDialogActionConfig } from '@shared/types';

export const ATTENDANCE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> =
  {
    [EButtonActionType.APPROVE]: {
      dialogConfig: APPROVE_CONFIRMATION_DIALOG_CONFIG,
      dynamicComponent: ApprovalAttendanceComponent,
    },

    [EButtonActionType.REJECT]: {
      dialogConfig: REJECT_CONFIRMATION_DIALOG_CONFIG,
      dynamicComponent: ApprovalAttendanceComponent,
    },

    [EButtonActionType.REGULARIZE]: {
      dynamicComponent: RegularizeAttendanceComponent,
      dialogConfig: {
        header: 'Regularize attendance',
        message:
          'Update status and assignment for this day. Food allowance follows the engineer on the snapshot.',
        size: EDialogSize.LARGE,
      },
    },

    [EButtonActionType.DELETE]: {
      dialogConfig: {
        ...DELETE_CONFIRMATION_DIALOG_CONFIG,
        header: 'Delete attendance?',
        message:
          'This removes the attendance for that day. Food allowance credited for it will be reversed, and a single-day leave will be restored to the balance. This cannot be undone.',
      },
      dynamicComponent: DeleteAttendanceComponent,
    },
  };
