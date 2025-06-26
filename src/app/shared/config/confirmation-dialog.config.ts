import { Validators } from "@angular/forms";
import { IConfirmationDialogConfig } from "../models";
import { EFieldType } from "../types";
import { EDialogPosition } from "../types";
import { ICONS } from "../constants";

export const CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  header: 'Delete Confirmation',
  icon: ICONS.COMMON.MANUAL,
  iconContainerClass: 'bg-primary text-primary-contrast',
  closeOnEscape: true,
  dismissableMask: false,
  closable: true,
  position: EDialogPosition.CENTER,
  blockScroll: false,
  styleClass: 'bg-primary',
  acceptButtonProps: {
    label: 'Yes',
    icon: ICONS.ACTIONS.CHECK,
    outlined: true,
    visible: true,
    styleClass: 'p-button-success',
  },
  rejectButtonProps: {
    label: 'No',
    icon: ICONS.ACTIONS.TIMES,
    outlined: true,
    visible: true,
    styleClass: 'p-button-secondary',
  },
};

export const DELETE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  icon: ICONS.ACTIONS.TRASH,
  iconContainerClass: 'bg-red-500 text-white',
  message: 'Are you sure you want to delete this item? This action cannot be undone.',
};

export const APPROVE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Approve Confirmation',
  icon: ICONS.ACTIONS.CHECK,
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
  icon: ICONS.ACTIONS.TIMES,
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
  icon: ICONS.ACTIONS.BAN,
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

export const ALLOCATE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Allocate Confirmation',
  icon: ICONS.EMPLOYEE.ADD_USER,
  iconContainerClass: 'bg-green-500 text-white',
  message: 'Are you sure you want to allocate this item?',
  inputFieldConfigs: [
    {
      fieldType: EFieldType.Select,
      fieldName: 'Employee Name',
      label: 'Employee',
      selectConfig: {
        optionsDropdown: [
          { label: 'John Doe', value: '1' },
          { label: 'Jane Smith', value: '2' },
          { label: 'Mike Johnson', value: '3' },
        ],
      },
      validators: [Validators.required],
    },
    {
      fieldType: EFieldType.TextArea,
      fieldName: 'comment',
    }
  ]
}

export const DEALLOCATE_CONFIRMATION_DIALOG_CONFIG: Partial<IConfirmationDialogConfig> = {
  ...CONFIRMATION_DIALOG_CONFIG,
  header: 'Deallocate Confirmation',
  icon: ICONS.EMPLOYEE.REMOVE_USER,
  iconContainerClass: 'bg-orange-500 text-white',
  message: 'Are you sure you want to deallocate this item?',
  inputFieldConfigs: [
    {
      fieldType: EFieldType.TextArea,
      fieldName: 'comment',
    }
  ]
}
