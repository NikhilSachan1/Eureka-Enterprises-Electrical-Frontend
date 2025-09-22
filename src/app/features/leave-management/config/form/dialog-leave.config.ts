import { Validators } from '@angular/forms';
import { ATTENDANCE_STATUS_DATA } from '@shared/config/static-data.config';
import { IFormInputFieldsConfig } from '@shared/models';
import { EFieldType } from '@shared/types';

export const APPROVE_LEAVE_DIALOG_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  approveReason: {
    fieldType: EFieldType.TextArea,
    id: 'approveReason',
    fieldName: 'comment',
    label: 'Approve Reason',
  },
};

export const REJECT_LEAVE_DIALOG_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  attendanceStatus: {
    fieldType: EFieldType.Select,
    id: 'attendanceStatus',
    fieldName: 'attendanceStatus',
    label: 'Attendance Status',
    selectConfig: {
      optionsDropdown: ATTENDANCE_STATUS_DATA,
    },
    validators: [Validators.required],
  },
  rejectReason: {
    fieldType: EFieldType.TextArea,
    id: 'rejectReason',
    fieldName: 'comment',
    label: 'Reject Reason',
    validators: [Validators.required],
  },
};

export const CANCEL_LEAVE_DIALOG_FORM_FIELDS_CONFIG: IFormInputFieldsConfig = {
  rejectReason: {
    fieldType: EFieldType.TextArea,
    id: 'cancelReason',
    fieldName: 'comment',
    label: 'Cancel Reason',
    validators: [Validators.required],
  },
};
