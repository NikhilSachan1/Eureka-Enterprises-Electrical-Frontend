import { IConfirmationDialogConfig } from "@shared/models";
import { EButtonSeverity } from "@shared/types";

export const ROLE_DELETE_DIALOG_CONFIG: IConfirmationDialogConfig = {
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

export const ROLE_BULK_DELETE_DIALOG_CONFIG: IConfirmationDialogConfig = {
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
  rowData: any,
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => ({
  ...ROLE_DELETE_DIALOG_CONFIG,
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
  selectedRows: any[],
  onAccept?: () => void,
  onReject?: () => void
): IConfirmationDialogConfig => ({
  ...ROLE_BULK_DELETE_DIALOG_CONFIG,
  onAccept,
  onReject,
});

