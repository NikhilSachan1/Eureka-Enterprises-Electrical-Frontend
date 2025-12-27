import { ApprovalLeaveComponent } from '@features/leave-management/components/approval-leave/approval-leave.component';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
  CANCEL_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';

export const LEAVE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.APPROVE]: {
    dialogConfig: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApprovalLeaveComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: REJECT_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApprovalLeaveComponent,
  },

  [EButtonActionType.CANCEL]: {
    dialogConfig: CANCEL_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApprovalLeaveComponent,
  },
};
