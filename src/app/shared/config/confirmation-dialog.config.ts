import {
  IConfirmationDialogSettingConfig,
  EDialogPosition,
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
    iconContainerClass: 'bg-red-500 text-white',
    message:
      'Are you sure you want to delete this item? This action cannot be undone.',
  };

export const APPROVE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Approve Confirmation',
    icon: ICONS.ACTIONS.CHECK,
    iconContainerClass: 'bg-green-500 text-white',
    message: 'Are you sure you want to approve this item?',
  };

export const REJECT_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Reject Confirmation',
    icon: ICONS.ACTIONS.TIMES,
    iconContainerClass: 'bg-orange-500 text-white',
    message: 'Are you sure you want to reject this item?',
  };

export const CANCEL_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Cancel Confirmation',
    icon: ICONS.ACTIONS.BAN,
    iconContainerClass: 'bg-orange-500 text-white',
    message: 'Are you sure you want to cancel this item?',
  };

export const REGULARIZE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Regularize Confirmation',
    icon: ICONS.ATTENDANCE.REGULARIZE,
    iconContainerClass: 'bg-orange-500 text-white',
    message: 'Are you sure you want to regularize this item?',
  };

export const ALLOCATE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Allocate Confirmation',
    icon: ICONS.EMPLOYEE.ADD_USER,
    iconContainerClass: 'bg-green-500 text-white',
    message: 'Are you sure you want to allocate this item?',
  };

export const DEALLOCATE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Deallocate Confirmation',
    icon: ICONS.EMPLOYEE.REMOVE_USER,
    iconContainerClass: 'bg-orange-500 text-white',
    message: 'Are you sure you want to deallocate this item?',
  };

export const WARNING_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogSettingConfig> =
  {
    ...CONFIRMATION_DIALOG_CONFIG,
    header: 'Warning Confirmation',
    icon: ICONS.COMMON.MANUAL,
    iconContainerClass: 'bg-orange-500 text-white',
    message: 'Are you sure you want to proceed?',
  };
