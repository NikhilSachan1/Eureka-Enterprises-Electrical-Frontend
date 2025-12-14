import { ApprovalExpenseComponent } from '@features/expense-management/components/approval-expense/approval-expense.component';
import { DeleteExpenseComponent } from '@features/expense-management/components/delete-expense/delete-expense.component';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';

export const EXPENSE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.APPROVE]: {
    actionWord: 'approve',
    singleLabel: 'Approve',
    bulkLabel: 'Approve Selected',
    dynamicComponent: ApprovalExpenseComponent,
  },
  [EButtonActionType.REJECT]: {
    actionWord: 'reject',
    singleLabel: 'Reject',
    bulkLabel: 'Reject Selected',
    dynamicComponent: ApprovalExpenseComponent,
  },
  [EButtonActionType.DELETE]: {
    actionWord: 'delete',
    singleLabel: 'Delete',
    bulkLabel: 'Delete Selected',
    dynamicComponent: DeleteExpenseComponent,
  },
};
