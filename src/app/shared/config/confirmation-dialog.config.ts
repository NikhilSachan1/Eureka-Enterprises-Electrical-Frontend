import { IConfirmationDialogConfig } from "../models/confirmation-dialog.model";
import { EDialogPosition } from "../types/confirmation-dialog.types";

export const CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  header: 'Delete Confirmation',
  icon: 'pi pi-exclamation-triangle',
  iconContainerClass: 'bg-primary text-primary-contrast',
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
  iconContainerClass: 'bg-red-500 text-white',
  message: 'Are you sure you want to delete this item? This action cannot be undone.',
  acceptButtonProps: {
    label: 'Delete',
    icon: 'pi pi-check',
    outlined: true,
    visible: true,
    styleClass: 'p-button-success',
  },
  rejectButtonProps: {
    label: 'Cancel',
    icon: 'pi pi-times',
    outlined: true,
    visible: true,
    styleClass: 'p-button-secondary',
  },
};

export const APPROVE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Approve Confirmation',
  icon: 'pi pi-check',
  iconContainerClass: 'bg-green-500 text-white',
  message: 'Are you sure you want to approve this item?',
  acceptButtonProps: {
    label: 'Approve',
    icon: 'pi pi-check',
    outlined: true,
    visible: true,
    styleClass: 'p-button-success',
  },
  rejectButtonProps: {
    label: 'Cancel',
    icon: 'pi pi-times',
    outlined: true,
    visible: true,
    styleClass: 'p-button-secondary',
  },
};

export const REJECT_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Reject Confirmation',
  icon: 'pi pi-times',
  iconContainerClass: 'bg-orange-500 text-white',
  message: 'Are you sure you want to reject this item?',
  acceptButtonProps: {
    label: 'Reject',
    icon: 'pi pi-times',
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
