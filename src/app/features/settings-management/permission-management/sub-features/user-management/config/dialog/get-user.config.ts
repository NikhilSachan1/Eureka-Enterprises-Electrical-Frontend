import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { DELETE_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import { DeleteUserPermissionComponent } from '../../components/delete-user-permission/delete-user-permission.component';
import { ChangeUserRoleComponent } from '../../components/change-user-role/change-user-role.component';

export const USER_ACTION_CONFIG_MAP: Record<string, IDialogActionConfig> = {
  [EButtonActionType.DELETE]: {
    dialogConfig: DELETE_CONFIRMATION_DIALOG_CONFIG,
    dynamicComponent: DeleteUserPermissionComponent,
  },
  [EButtonActionType.CHANGE_USER_ROLE]: {
    dialogConfig: {
      header: 'Change User Role',
      message: 'Are you sure you want to change user role to this user?',
    },
    dynamicComponent: ChangeUserRoleComponent,
  },
};
