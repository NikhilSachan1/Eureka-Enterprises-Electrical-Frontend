import { ChangeStatusEmployeeComponent } from '@features/employee-management/components/change-status-employee/change-status-employee.component';
import { DeleteEmployeeComponent } from '@features/employee-management/components/delete-employee/delete-employee.component';
import { SendPasswordLinkEmployeeComponent } from '@features/employee-management/components/send-password-link-employee/send-password-link-employee.component';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';

export const EMPLOYEE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    actionWord: 'delete',
    singleLabel: 'Delete',
    bulkLabel: 'Delete Selected',
    dynamicComponent: DeleteEmployeeComponent,
  },
  [EButtonActionType.SEND_PASSWORD_LINK]: {
    actionWord: 'send password link',
    singleLabel: 'Send Password Link',
    bulkLabel: 'Send Password Link to Selected',
    dynamicComponent: SendPasswordLinkEmployeeComponent,
  },
  [EButtonActionType.CHANGE_EMPLOYEE_STATUS]: {
    actionWord: 'change employee status',
    singleLabel: 'Change Employee Status',
    bulkLabel: 'Change Employee Status to Selected',
    dynamicComponent: ChangeStatusEmployeeComponent,
  },
};
