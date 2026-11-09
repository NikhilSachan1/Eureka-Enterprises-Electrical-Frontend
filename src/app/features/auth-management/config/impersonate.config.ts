import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { EEmployeeStatus } from '@features/employee-management/types/employee.types';
import { ICONS } from '@shared/constants';
import { EUserRole } from '@shared/constants/role.constants';
import {
  EButtonActionType,
  IDialogActionConfig,
  ITableActionConfig,
} from '@shared/types';
import { ImpersonateUserComponent } from '../components/impersonate-user/impersonate-user.component';

interface IImpersonationTargetRow {
  status: string;
  roles: { name: string }[];
}

export const LOGIN_AS_ROW_ACTION: Partial<
  ITableActionConfig<IImpersonationTargetRow>
> = {
  id: EButtonActionType.LOGIN_AS,
  label: 'Login as User',
  tooltip: 'Login as User',
  icon: ICONS.ATTENDANCE.CHECK_IN,
  permission: [APP_PERMISSION.UI.COMMON.LOGIN_AS_USER],
  hideWhen: row =>
    row.roles.some(role => role.name.toUpperCase() === EUserRole.SUPER_ADMIN),
  disableWhen: row => row.status !== EEmployeeStatus.ACTIVE,
  disableReason: () => 'Only users with Active status can be signed in to.',
};

export const LOGIN_AS_DIALOG_ACTION: IDialogActionConfig = {
  dialogConfig: {
    header: 'Login as this user',
    message:
      'You will see the app exactly as this user does, for up to one hour. Everything you do is recorded against your account in the audit log.',
  },
  dynamicComponent: ImpersonateUserComponent,
};
