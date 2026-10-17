import { AddUserDelegationComponent } from '@features/settings-management/delegation-management/components/add-user-delegation/add-user-delegation.component';
import { WithdrawUserDelegationComponent } from '@features/settings-management/delegation-management/components/withdraw-user-delegation/withdraw-user-delegation.component';
import { CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { ICONS } from '@shared/constants';
import {
  EButtonActionType,
  EButtonSeverity,
  IDialogActionConfig,
} from '@shared/types';

export const USER_DELEGATION_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.ADD]: {
    dialogConfig: {
      header: 'Grant delegation',
      message: 'Choose the manager, the employee, and the module.',
    },
    dynamicComponent: AddUserDelegationComponent,
  },
  [EButtonActionType.CANCEL]: {
    dialogConfig: {
      ...CONFIRMATION_DIALOG_CONFIG,
      header: 'Withdraw this delegation?',
      icon: ICONS.ACTIONS.BAN,
      message:
        'This stops immediately. The manager can no longer handle new entries for this member. Entries already filed stay as they are.',
      acceptButtonProps: {
        ...CONFIRMATION_DIALOG_CONFIG.acceptButtonProps,
        label: 'Withdraw',
        severity: EButtonSeverity.WARNING,
      },
      rejectButtonProps: {
        ...CONFIRMATION_DIALOG_CONFIG.rejectButtonProps,
        label: 'Keep',
      },
    },
    dynamicComponent: WithdrawUserDelegationComponent,
  },
};
