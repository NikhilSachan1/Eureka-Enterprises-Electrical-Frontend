import { ApprovalExpenseComponent } from '@features/expense-management/components/approval-expense/approval-expense.component';
import { DeleteExpenseComponent } from '@features/expense-management/components/delete-expense/delete-expense.component';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import {
  APPROVE_CONFIRMATION_DIALOG_CONFIG,
  REJECT_CONFIRMATION_DIALOG_CONFIG,
  DELETE_CONFIRMATION_DIALOG_CONFIG,
} from '@shared/config';

export const EXPENSE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.APPROVE]: {
    dialogConfig: APPROVE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApprovalExpenseComponent,
  },

  [EButtonActionType.REJECT]: {
    dialogConfig: REJECT_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: ApprovalExpenseComponent,
  },

  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteExpenseComponent,
  },
};
