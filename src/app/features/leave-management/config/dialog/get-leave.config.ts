import { ApprovalLeaveComponent } from '@features/leave-management/components/approval-leave/approval-leave.component';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';

export const LEAVE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.APPROVE]: {
    actionWord: 'approve',
    singleLabel: 'Approve',
    bulkLabel: 'Approve Selected',
    dynamicComponent: ApprovalLeaveComponent,
  },
  [EButtonActionType.REJECT]: {
    actionWord: 'reject',
    singleLabel: 'Reject',
    bulkLabel: 'Reject Selected',
    dynamicComponent: ApprovalLeaveComponent,
  },
  [EButtonActionType.CANCEL]: {
    actionWord: 'cancel',
    singleLabel: 'Cancel',
    bulkLabel: 'Cancel Selected',
    dynamicComponent: ApprovalLeaveComponent,
  },
};
