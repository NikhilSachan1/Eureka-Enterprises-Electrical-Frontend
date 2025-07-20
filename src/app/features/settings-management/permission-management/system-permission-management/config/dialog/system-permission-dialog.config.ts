import { EButtonSeverity } from '@shared/types';
import { IConfirmationDialogConfig } from '@shared/models';
import { IGetSingleSystemPermissionListResponseDto } from '../../models/system-permission.api.model';

export const SYSTEM_PERMISSION_DELETE_DIALOG_CONFIG: IConfirmationDialogConfig =
  {
    dialogSettingConfig: {
      header: 'Delete Permission',
      message: 'Are you sure you want to delete this permission?',
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

export const SYSTEM_PERMISSION_BULK_DELETE_DIALOG_CONFIG: IConfirmationDialogConfig =
  {
    dialogSettingConfig: {
      header: 'Delete Permissions',
      message: 'Are you sure you want to delete the selected permissions?',
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

export const createSystemPermissionDeleteDialogConfig = (
  rowData: IGetSingleSystemPermissionListResponseDto,
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => ({
  ...SYSTEM_PERMISSION_DELETE_DIALOG_CONFIG,
  recordDetails: {
    details: [
      { label: 'Name', value: rowData.label },
      { label: 'Module', value: rowData.module },
      { label: 'Description', value: rowData.description },
      { label: 'Code', value: rowData.name },
    ],
  },
  onAccept,
  onReject,
});

export const createSystemPermissionBulkDeleteDialogConfig = (
  selectedRows: IGetSingleSystemPermissionListResponseDto[],
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => ({
  ...SYSTEM_PERMISSION_BULK_DELETE_DIALOG_CONFIG,
  onAccept,
  onReject,
});
