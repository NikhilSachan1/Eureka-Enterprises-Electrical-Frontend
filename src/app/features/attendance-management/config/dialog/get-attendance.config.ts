import { ApprovalAttendanceComponent } from '@features/attendance-management/components/approval-attendance/approval-attendance.component';
import { RegularizeAttendanceComponent } from '@features/attendance-management/components/regularize-attendance/regularize-attendance.component';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';

export const ATTENDANCE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> =
  {
    [EButtonActionType.APPROVE]: {
      actionWord: 'approve',
      singleLabel: 'Approve',
      bulkLabel: 'Approve All',
      dynamicComponent: ApprovalAttendanceComponent,
    },
    [EButtonActionType.REJECT]: {
      actionWord: 'reject',
      singleLabel: 'Reject',
      bulkLabel: 'Reject All',
      dynamicComponent: ApprovalAttendanceComponent,
    },
    [EButtonActionType.REGULARIZE]: {
      actionWord: 'regularize',
      singleLabel: 'Regularize',
      bulkLabel: 'Regularize',
      dynamicComponent: RegularizeAttendanceComponent,
    },
  };
