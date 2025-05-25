import { IConfirmationDialogConfig } from "../models/confirmation-dialog.model";
import { EDialogPosition } from "../types/confirmation-dialog.types";

export const CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  header: 'Delete Confirmation',
  icon: 'pi pi-exclamation-triangle',
  closeOnEscape: true,
  dismissableMask: false,
  closable: true,
  position: EDialogPosition.CENTER,
  blockScroll: false,
  styleClass: 'bg-primary',
};

export const DELETE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  icon: 'pi pi-trash',
  message: 'Are you sure you want to delete this item? This action cannot be undone.',
  acceptButtonProps: {
    label: 'Delete',
    icon: 'pi pi-check',
    outlined: true,
    visible: true,
    styleClass: 'p-button-danger',
  },
  rejectButtonProps: {
    label: 'Cancel',
    icon: 'pi pi-times',
    outlined: true,
    visible: true,
    styleClass: 'p-button-secondary',
  },
};