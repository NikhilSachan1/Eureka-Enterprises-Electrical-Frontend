import { ChangeStatusEmployeeComponent } from '@features/employee-management/components/change-status-employee/change-status-employee.component';
import { DeleteEmployeeComponent } from '@features/employee-management/components/delete-employee/delete-employee.component';
import { ResetPasswordEmployeeComponent } from '../../components/reset-password-employee/reset-password-employee.component';
import { SendPasswordLinkEmployeeComponent } from '@features/employee-management/components/send-password-link-employee/send-password-link-employee.component';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';

export const EMPLOYEE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteEmployeeComponent,
  },
  [EButtonActionType.SEND_PASSWORD_LINK]: {
    dialogConfig: {
      header: 'Send password setup link',
      message:
        'Send a password setup link to this employee? They will get instructions by email.',
    },
    dynamicComponent: SendPasswordLinkEmployeeComponent,
  },
  [EButtonActionType.RESET_PASSWORD]: {
    dialogConfig: {
      header: 'Reset employee password',
      message:
        "Set a new password for this employee? They will use it the next time they sign in.",
    },
    dynamicComponent: ResetPasswordEmployeeComponent,
  },
  [EButtonActionType.CHANGE_STATUS]: {
    dialogConfig: {
      header: 'Change employee status',
      message: "Update this employee's status? Choose the new status below.",
    },
    dynamicComponent: ChangeStatusEmployeeComponent,
  },
};
