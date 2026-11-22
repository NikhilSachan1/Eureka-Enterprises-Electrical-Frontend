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

/**
 * "Back out" button of a destructive dialog. The dialog focuses it on open (see
 * ConfirmationDialogComponent), so a stray Enter never deletes or rejects anything.
 */
const SAFE_CANCEL_BUTTON_PROPS: IDialogConfig['rejectButtonProps'] = {
  label: 'Cancel',
  icon: ICONS.ACTIONS.TIMES,
  severity: EButtonSeverity.SECONDARY,
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
  acceptButtonProps: {
    label: 'Delete',
    id: EButtonActionType.DELETE,
    icon: ICONS.ACTIONS.TRASH,
    severity: EButtonSeverity.DANGER,
  },
  rejectButtonProps: SAFE_CANCEL_BUTTON_PROPS,
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
  acceptButtonProps: {
    label: 'Reject',
    id: EButtonActionType.REJECT,
    icon: ICONS.ACTIONS.BAN,
    severity: EButtonSeverity.DANGER,
  },
  rejectButtonProps: SAFE_CANCEL_BUTTON_PROPS,
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
  // "Cancel" would be ambiguous on both buttons, so name what each one does.
  acceptButtonProps: {
    label: 'Cancel request',
    id: EButtonActionType.CANCEL,
    icon: ICONS.ACTIONS.BAN,
    severity: EButtonSeverity.DANGER,
  },
  rejectButtonProps: {
    label: 'Keep request',
    icon: ICONS.COMMON.ARROW_LEFT,
    severity: EButtonSeverity.SECONDARY,
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

/** Asked by the unsaved-changes route guard before leaving a page with unsaved input. */
export const UNSAVED_CHANGES_DIALOG_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Leave without saving?',
  message:
    'You have changes on this page that are not saved yet. If you leave now, they will be lost.',
  icon: ICONS.COMMON.EXCLAMATION_TRIANGLE,
  size: EDialogSize.SMALL,
  // The user must pick: the pending navigation waits on this answer.
  closable: false,
  closeOnEscape: false,
  dismissableMask: false,
  acceptButtonProps: {
    label: 'Leave page',
    id: EButtonActionType.CANCEL,
    icon: ICONS.ACTIONS.TIMES,
    severity: EButtonSeverity.DANGER,
  },
  rejectButtonProps: {
    label: 'Stay on page',
    icon: ICONS.COMMON.ARROW_LEFT,
    severity: EButtonSeverity.SECONDARY,
  },
};

const FORM_RESET_DIALOG_BASE_CONFIG: Partial<IDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  size: EDialogSize.SMALL,
  rejectButtonProps: {
    label: 'Keep editing',
    icon: ICONS.ACTIONS.TIMES,
    severity: EButtonSeverity.SECONDARY,
  },
};

/**
 * Multi-step form, one step (`stepName` e.g. "Bank step"). `undo` = edit form, where the step goes back to the saved
 * details instead of blank.
 */
export function buildResetStepDialogConfig(
  stepName: string,
  undo: boolean
): Partial<IDialogConfig> {
  return {
    ...FORM_RESET_DIALOG_BASE_CONFIG,
    header: undo ? `Undo changes on ${stepName}?` : `Clear ${stepName}?`,
    message: undo
      ? 'This step goes back to the saved details. Other steps are not touched.'
      : 'Everything you entered on this step will be removed. Other steps are not touched.',
    icon: undo ? ICONS.COMMON.UNDO : ICONS.COMMON.ERASER,
    acceptButtonProps: {
      label: undo ? 'Undo step' : 'Clear step',
      id: EButtonActionType.RESET,
      icon: undo ? ICONS.COMMON.UNDO : ICONS.COMMON.ERASER,
      severity: EButtonSeverity.DANGER,
    },
  };
}

/** Multi-step form, every step: names the steps that will lose input. */
export function buildResetAllStepsDialogConfig(
  changedStepLabels: string[],
  totalSteps: number,
  undo: boolean
): Partial<IDialogConfig> {
  const count = changedStepLabels.length;
  const stepWord = count === 1 ? 'step' : 'steps';
  const stepList = changedStepLabels.join(', ');

  return {
    ...FORM_RESET_DIALOG_BASE_CONFIG,
    header: undo ? 'Undo all changes?' : 'Clear all steps?',
    message: undo
      ? `Your changes on ${count} ${stepWord} (${stepList}) will be discarded and the saved details shown again.`
      : `What you entered on ${count} of ${totalSteps} ${totalSteps === 1 ? 'step' : 'steps'} (${stepList}) will be removed. This cannot be undone.`,
    icon: undo ? ICONS.COMMON.UNDO : ICONS.COMMON.ERASER,
    acceptButtonProps: {
      label: undo ? 'Undo all' : 'Clear all',
      id: EButtonActionType.RESET,
      icon: undo ? ICONS.COMMON.UNDO : ICONS.COMMON.ERASER,
      severity: EButtonSeverity.DANGER,
    },
  };
}

/** Single-step page form. `undo` = edit page, where the saved details come back. */
export function buildResetFormDialogConfig(
  undo: boolean
): Partial<IDialogConfig> {
  return {
    ...FORM_RESET_DIALOG_BASE_CONFIG,
    header: undo ? 'Undo your changes?' : 'Clear this form?',
    message: undo
      ? 'The saved details will be shown again and your changes discarded.'
      : 'Everything you entered on this form will be removed. This cannot be undone.',
    icon: undo ? ICONS.COMMON.UNDO : ICONS.COMMON.ERASER,
    acceptButtonProps: {
      label: undo ? 'Undo changes' : 'Clear form',
      id: EButtonActionType.RESET,
      icon: undo ? ICONS.COMMON.UNDO : ICONS.COMMON.ERASER,
      severity: EButtonSeverity.DANGER,
    },
  };
}
