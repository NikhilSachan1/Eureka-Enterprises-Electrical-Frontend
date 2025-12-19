import {
  IConfirmationDialogSettingConfig,
  EDialogPosition,
  EButtonActionType,
} from '@shared/types';
import { ICONS } from '@shared/constants';

export const CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    header: 'Delete Confirmation',
    icon: ICONS.COMMON.MANUAL,
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
    icon: ICONS.ACTIONS.TRASH,
    message:
      'Are you sure you want to delete this item? This action cannot be undone.',
  };

export const APPROVE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Approve Confirmation',
    icon: ICONS.ACTIONS.CHECK,
    message: 'Are you sure you want to approve this item?',
  };

export const REJECT_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Reject Confirmation',
    icon: ICONS.ACTIONS.TIMES,
    message: 'Are you sure you want to reject this item?',
  };

export const CANCEL_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Cancel Confirmation',
    icon: ICONS.ACTIONS.BAN,
    message: 'Are you sure you want to cancel this item?',
  };

export const REGULARIZE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Regularize Confirmation',
    icon: ICONS.ATTENDANCE.REGULARIZE,
    message: 'Are you sure you want to regularize this item?',
  };
