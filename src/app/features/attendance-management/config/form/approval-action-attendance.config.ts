import { Validators } from '@angular/forms';
import { EFieldType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';

const APPROVAL_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  approveReason: {
    fieldType: EFieldType.TextArea,
    id: 'approveReason',
    fieldName: 'approveReason',
    label: 'Approve Reason',
  },
  rejectReason: {
    fieldType: EFieldType.TextArea,
    id: 'rejectReason',
    fieldName: 'rejectReason',
    label: 'Reject Reason',
    validators: [Validators.required],
  },
};

export const APPROVAL_ACTION_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: APPROVAL_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG,
};
