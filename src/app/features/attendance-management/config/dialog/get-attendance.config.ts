import { ApprovalAttendanceComponent } from '@features/attendance-management/components/approval-attendance/approval-attendance.component';
import { RegularizeAttendanceComponent } from '@features/attendance-management/components/regularize-attendance/regularize-attendance.component';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';

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
          'Submit a regularization for this attendance record? Add details below.',
      },
    },
  };
