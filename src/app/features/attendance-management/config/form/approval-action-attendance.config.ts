import { Validators } from '@angular/forms';
import { EFieldType, IFormConfig, IFormInputFieldsConfig } from '@shared/types';

const APPROVE_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  approveReason: {
    fieldType: EFieldType.TextArea,
    id: 'approveReason',
    fieldName: 'comment',
    label: 'Approve Reason',
  },
};

export const APPROVE_ACTION_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: APPROVE_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG,
};

const REJECT_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  rejectReason: {
    fieldType: EFieldType.TextArea,
    id: 'rejectReason',
    fieldName: 'comment',
    label: 'Reject Reason',
    validators: [Validators.required],
  },
};

export const REJECT_ACTION_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: REJECT_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG,
};
