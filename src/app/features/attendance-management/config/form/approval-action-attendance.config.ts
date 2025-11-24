import { Validators } from '@angular/forms';
import { IFormConfig, IFormInputFieldsConfig } from '@shared/models';
import { EFieldType } from '@shared/types';

const APPROVAL_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  approveReason: {
    fieldType: EFieldType.TextArea,
    id: 'approveReason',
    fieldName: 'comment',
    label: 'Approve Reason',
  },
  rejectReason: {
    fieldType: EFieldType.TextArea,
    id: 'rejectReason',
    fieldName: 'comment',
    label: 'Reject Reason',
    validators: [Validators.required],
  },
};

export const APPROVAL_ACTION_ATTENDANCE_FORM_CONFIG: IFormConfig = {
  fields: APPROVAL_ACTION_ATTENDANCE_FORM_FIELDS_CONFIG,
};
