import { EButtonSeverity } from '@app/shared/types';
import { IConfirmationDialogConfig } from '@shared/models';
import { IUser } from '../../types/user.interface';

export const USER_PERMISSION_DIALOG_DELETE_CONFIG: IConfirmationDialogConfig = {
  dialogSettingConfig: {
    header: 'Delete User Permission',
    message: 'Are you sure you want to delete this user permission?',
    acceptButtonProps: {
      label: 'Delete',
      severity: EButtonSeverity.DANGER,
    },
    rejectButtonProps: {
      label: 'Cancel',
      severity: EButtonSeverity.SECONDARY,
    },
  },
};

export const createUserPermissionDeleteDialogConfig = (
  rowData: IUser,
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => ({
  ...USER_PERMISSION_DIALOG_DELETE_CONFIG,
  recordDetails: {
    details: [
      { label: 'Name', value: rowData.fullName },
      { label: 'Role', value: rowData.role },
    ],
  },
  onAccept,
  onReject,
});
