import { ICONS } from '@shared/constants';
import {
  IDialogConfig,
  EDialogPosition,
  EButtonActionType,
  EButtonSeverity,
} from '@shared/types';

export const CONFIRMATION_DIALOG_CONFIG: Partial<IDialogConfig> = {
  closeOnEscape: true,
  dismissableMask: false,
  closable: true,
  position: EDialogPosition.CENTER,
  blockScroll: false,
  styleClass: 'confirmation-dialog-panel',
  acceptButtonProps: {
    label: 'Yes',
    id: EButtonActionType.SUBMIT,
    icon: ICONS.ACTIONS.CHECK,
    severity: EButtonSeverity.PRIMARY,
  },
  rejectButtonProps: {
    label: 'No',
    icon: ICONS.ACTIONS.TIMES,
    severity: EButtonSeverity.SECONDARY,
  },
};

export const DELETE_CONFIRMATION_DIALOG_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Delete Confirmation',
  message:
    'Are you sure you want to delete this item? This action cannot be undone.',
  labels: {
    actionWord: 'delete',
    singleLabel: 'Delete',
    bulkLabel: 'Delete Selected',
  },
};

export const APPROVE_CONFIRMATION_DIALOG_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Approve Confirmation',
  message: 'Are you sure you want to approve this item?',
  labels: {
    actionWord: 'approve',
    singleLabel: 'Approve',
    bulkLabel: 'Approve Selected',
  },
};

export const REJECT_CONFIRMATION_DIALOG_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Reject Confirmation',
  message: 'Are you sure you want to reject this item?',
  labels: {
    actionWord: 'reject',
    singleLabel: 'Reject',
    bulkLabel: 'Reject Selected',
  },
};

export const CANCEL_CONFIRMATION_DIALOG_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Cancel Confirmation',
  message: 'Are you sure you want to cancel this item?',
  labels: {
    actionWord: 'cancel',
    singleLabel: 'Cancel',
    bulkLabel: 'Cancel Selected',
  },
};
