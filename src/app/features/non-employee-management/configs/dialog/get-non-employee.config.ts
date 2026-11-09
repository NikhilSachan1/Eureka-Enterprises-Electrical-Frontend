import { LOGIN_AS_DIALOG_ACTION } from '@features/auth-management/config/impersonate.config';
import { ChangeStatusNonEmployeeComponent } from '@features/non-employee-management/components/change-status-non-employee/change-status-non-employee.component';
import { DeleteNonEmployeeComponent } from '@features/non-employee-management/components/delete-non-employee/delete-non-employee.component';
import { SendPasswordLinkEmployeeComponent } from '@features/employee-management/components/send-password-link-employee/send-password-link-employee.component';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';

export const NON_EMPLOYEE_ACTION_CONFIG_MAP: Record<
  string,
  IDialogActionConfig
> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteNonEmployeeComponent,
  },
  [EButtonActionType.SEND_PASSWORD_LINK]: {
    dialogConfig: {
      header: 'Send password setup link',
      message:
        'Send a password setup link to this user? They will get instructions by email.',
    },
    dynamicComponent: SendPasswordLinkEmployeeComponent,
  },
  [EButtonActionType.LOGIN_AS]: LOGIN_AS_DIALOG_ACTION,
  [EButtonActionType.CHANGE_STATUS]: {
    dialogConfig: {
      header: 'Change status',
      message: "Update this user's status? An archived user cannot log in.",
    },
    dynamicComponent: ChangeStatusNonEmployeeComponent,
  },
};
