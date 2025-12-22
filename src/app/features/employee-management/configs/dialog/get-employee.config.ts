import { DeleteEmployeeComponent } from '@features/employee-management/components/delete-employee/delete-employee.component';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';

export const EMPLOYEE_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    actionWord: 'delete',
    singleLabel: 'Delete',
    bulkLabel: 'Delete Selected',
    dynamicComponent: DeleteEmployeeComponent,
  },
};
