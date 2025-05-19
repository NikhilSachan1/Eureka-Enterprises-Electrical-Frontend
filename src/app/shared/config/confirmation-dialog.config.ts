import { ConfirmationOptions } from '../models/confirmation-dialog.model';

export enum ConfirmationActionType {
  DELETE = 'DELETE'
}

export enum ConfirmationSeverity {
  DANGER = 'danger'
}

export interface ConfirmationConfig extends ConfirmationOptions {
  severity: ConfirmationSeverity;
  isPlural?: boolean;
}

export const CONFIRMATION_DIALOG_CONFIG: Record<ConfirmationActionType, ConfirmationConfig> = {
  [ConfirmationActionType.DELETE]: {
    header: 'Delete Confirmation',
    message: 'Are you sure you want to delete this item? This action cannot be undone.',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptButtonStyleClass: 'p-button-danger',
    rejectButtonStyleClass: 'p-button-secondary',
    severity: ConfirmationSeverity.DANGER,
    isPlural: false
  }
}; 