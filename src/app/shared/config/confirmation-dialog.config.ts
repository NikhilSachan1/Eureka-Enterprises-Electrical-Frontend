import { ICONS } from '@shared/constants';
import {
  IDialogConfig,
  EDialogPosition,
  EDialogSize,
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
  header: 'Delete this item?',
  message:
    'This will permanently remove the selected record. You cannot undo this.',
  labels: {
    actionWord: 'delete',
    singleLabel: 'Delete',
    bulkLabel: 'Delete Selected',
  },
};

export const APPROVE_CONFIRMATION_DIALOG_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Approve?',
  message: 'Proceed with approval for this item?',
  labels: {
    actionWord: 'approve',
    singleLabel: 'Approve',
    bulkLabel: 'Approve Selected',
  },
};

export const REJECT_CONFIRMATION_DIALOG_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Reject?',
  message: 'Proceed with rejection for this item?',
  labels: {
    actionWord: 'reject',
    singleLabel: 'Reject',
    bulkLabel: 'Reject Selected',
  },
};

export const CANCEL_CONFIRMATION_DIALOG_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Cancel this request?',
  message: 'The selected request will be cancelled. Continue?',
  labels: {
    actionWord: 'cancel',
    singleLabel: 'Cancel',
    bulkLabel: 'Cancel Selected',
  },
};

export const PLAIN_CONFIRMATION_DIALOG_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: '',
  message: '',
  icon: '',
  size: EDialogSize.LARGE,
  acceptButtonProps: {
    label: 'Save',
    id: EButtonActionType.SUBMIT,
    icon: ICONS.ACTIONS.CHECK,
    severity: EButtonSeverity.PRIMARY,
  },
  rejectButtonProps: {
    label: 'Cancel',
    icon: ICONS.ACTIONS.TIMES,
    severity: EButtonSeverity.SECONDARY,
  },
};
