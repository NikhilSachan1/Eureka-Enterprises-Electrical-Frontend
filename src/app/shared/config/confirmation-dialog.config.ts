import { Validators } from "@angular/forms";
import { IConfirmationDialogConfig } from "../models/confirmation-dialog.model";
import { EFieldType } from "../types";
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
  acceptButtonProps: {
    label: 'Yes',
    icon: 'pi pi-check',
    outlined: true,
    visible: true,
    styleClass: 'p-button-success',
  },
  rejectButtonProps: {
    label: 'No',
    icon: 'pi pi-times',
    outlined: true,
    visible: true,
    styleClass: 'p-button-secondary',
  },
};

export const DELETE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  icon: 'pi pi-trash',
  iconContainerClass: 'bg-red-500 text-white',
  message: 'Are you sure you want to delete this item? This action cannot be undone.',
};

export const APPROVE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Approve Confirmation',
  icon: 'pi pi-check',
  iconContainerClass: 'bg-green-500 text-white',
  message: 'Are you sure you want to approve this item?',
  inputFieldConfigs: [
    {
      fieldType: EFieldType.TextArea,
      fieldName: 'comment',
      label: 'Comment (Required)',
      validators: [Validators.required, Validators.minLength(10)],
    },
  ]
};

export const REJECT_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Reject Confirmation',
  icon: 'pi pi-times',
  iconContainerClass: 'bg-orange-500 text-white',
  message: 'Are you sure you want to reject this item?',
  inputFieldConfigs: [
    {
      fieldType: EFieldType.TextArea,
      fieldName: 'comment',
      label: 'Comment (Required)',
      validators: [Validators.required, Validators.minLength(10)],
    },
  ]
};

export const CANCEL_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Cancel Confirmation',
  icon: 'pi pi-ban',
  iconContainerClass: 'bg-orange-500 text-white',
  message: 'Are you sure you want to cancel this item?',
  inputFieldConfigs: [
    {
      fieldType: EFieldType.TextArea,
      fieldName: 'comment',
      label: 'Comment (Required)',
      validators: [Validators.required, Validators.minLength(10)],
    },
  ]
};
