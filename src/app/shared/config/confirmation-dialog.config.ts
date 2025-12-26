import { ICONS } from '@shared/constants';
import {
  IConfirmationDialogSettingConfig,
  EDialogPosition,
  EButtonActionType,
} from '@shared/types';
import { IconUtil } from '@shared/utility';

export const CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    header: 'Delete Confirmation',
    icon: IconUtil.getIcon('default') ?? undefined,
    iconContainerClass: 'bg-primary text-primary-contrast',
    message: 'Are you sure you want to proceed?',
    closeOnEscape: true,
    dismissableMask: false,
    closable: true,
    position: EDialogPosition.CENTER,
    blockScroll: false,
    styleClass: 'bg-primary',
    acceptButtonProps: {
      label: 'Yes',
      id: EButtonActionType.SUBMIT,
      icon: ICONS.ACTIONS.CHECK,
    },
    rejectButtonProps: {
      label: 'No',
      icon: ICONS.ACTIONS.TIMES,
    },
  };

export const DELETE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Delete Confirmation',
    icon: IconUtil.getIcon(EButtonActionType.DELETE) ?? undefined,
    message:
      'Are you sure you want to delete this item? This action cannot be undone.',
  };

export const APPROVE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Approve Confirmation',
    icon: IconUtil.getIcon(EButtonActionType.APPROVE) ?? undefined,
    message: 'Are you sure you want to approve this item?',
  };

export const REJECT_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Reject Confirmation',
    icon: IconUtil.getIcon(EButtonActionType.REJECT) ?? undefined,
    message: 'Are you sure you want to reject this item?',
  };

export const CANCEL_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Cancel Confirmation',
    icon: IconUtil.getIcon(EButtonActionType.CANCEL) ?? undefined,
    message: 'Are you sure you want to cancel this item?',
  };

export const REGULARIZE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Regularize Confirmation',
    icon: IconUtil.getIcon(EButtonActionType.REGULARIZE) ?? undefined,
    message: 'Are you sure you want to regularize this item?',
  };

export const SEND_PASSWORD_LINK_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Send Password Link Confirmation',
    icon: IconUtil.getIcon(EButtonActionType.SEND_PASSWORD_LINK) ?? undefined,
    message:
      'Are you sure you want to send password reset link to this employee?',
  };

export const CHANGE_EMPLOYEE_STATUS_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Change Employee Status Confirmation',
    icon:
      IconUtil.getIcon(EButtonActionType.CHANGE_EMPLOYEE_STATUS) ?? undefined,
    message: 'Are you sure you want to change the status of this employee?',
  };
