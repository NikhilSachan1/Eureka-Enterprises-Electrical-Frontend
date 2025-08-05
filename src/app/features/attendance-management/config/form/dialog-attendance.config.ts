import { Validators } from '@angular/forms';
import { IFormInputFieldsConfig } from '@shared/models';
import { EFieldType } from '@shared/types';

export const APPROVE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG: IFormInputFieldsConfig =
  {
    approveReason: {
      fieldType: EFieldType.TextArea,
      id: 'approveReason',
      fieldName: 'approveReason',
      label: 'Approve Reason',
      validators: [Validators.required],
    },
  };

export const REJECT_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG: IFormInputFieldsConfig =
  {
    rejectReason: {
      fieldType: EFieldType.TextArea,
      id: 'rejectReason',
      fieldName: 'rejectReason',
      label: 'Reject Reason',
      validators: [Validators.required],
    },
  };
