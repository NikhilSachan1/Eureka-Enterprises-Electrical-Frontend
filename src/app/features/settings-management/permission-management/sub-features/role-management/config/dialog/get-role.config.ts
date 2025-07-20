import { IConfirmationDialogConfig } from '@shared/models';
import { EButtonSeverity } from '@shared/types';
import { IRoleGetBaseResponseDto } from '../../types/role.dto';

export const ROLE_DIALOG_DELETE_CONFIG: IConfirmationDialogConfig = {
  dialogSettingConfig: {
    header: 'Delete Role',
    message: 'Are you sure you want to delete this role?',
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

export const ROLE_DIALOG_BULK_DELETE_CONFIG: IConfirmationDialogConfig = {
  dialogSettingConfig: {
    header: 'Delete Roles',
    message: 'Are you sure you want to delete the selected roles?',
    acceptButtonProps: {
      label: 'Delete All',
      severity: EButtonSeverity.DANGER,
    },
    rejectButtonProps: {
      label: 'Cancel',
      severity: EButtonSeverity.SECONDARY,
    },
  },
};

export const createRoleDeleteDialogConfig = (
  rowData: IRoleGetBaseResponseDto,
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => ({
  ...ROLE_DIALOG_DELETE_CONFIG,
  recordDetails: {
    details: [
      { label: 'Name', value: rowData.label },
      { label: 'Description', value: rowData.description },
      { label: 'Permissions', value: rowData.permissionCount },
    ],
  },
  onAccept,
  onReject,
});

export const createRoleBulkDeleteDialogConfig = (
  selectedRows: IRoleGetBaseResponseDto[],
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => ({
  ...ROLE_DIALOG_BULK_DELETE_CONFIG,
  onAccept,
  onReject,
});
