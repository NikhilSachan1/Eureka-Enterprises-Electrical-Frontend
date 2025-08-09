import { Validators } from '@angular/forms';
import {
  ATTENDANCE_STATUS_DATA,
  CLIENT_NAME_DATA,
  LOCATION_DATA,
} from '@shared/config/static-data.config';
import { IFormInputFieldsConfig } from '@shared/models';
import { EFieldType } from '@shared/types';

export const APPROVE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG: IFormInputFieldsConfig =
  {
    approveReason: {
      fieldType: EFieldType.TextArea,
      id: 'approveReason',
      fieldName: 'comment',
      label: 'Approve Reason',
    },
  };

export const REJECT_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG: IFormInputFieldsConfig =
  {
    rejectReason: {
      fieldType: EFieldType.TextArea,
      id: 'rejectReason',
      fieldName: 'comment',
      label: 'Reject Reason',
      validators: [Validators.required],
    },
  };

export const REGULARIZE_ATTENDANCE_DIALOG_FORM_FIELDS_CONFIG: IFormInputFieldsConfig =
  {
    attendanceStatus: {
      fieldType: EFieldType.Select,
      id: 'attendanceStatus',
      fieldName: 'attendanceStatus',
      label: 'Attendance Status',
      selectConfig: {
        haveFilter: false,
        optionsDropdown: ATTENDANCE_STATUS_DATA,
      },
      validators: [Validators.required],
    },
    clientName: {
      fieldType: EFieldType.Select,
      id: 'clientName',
      fieldName: 'clientName',
      label: 'Client Name',
      selectConfig: {
        optionsDropdown: CLIENT_NAME_DATA,
      },
      validators: [Validators.required],
    },
    location: {
      fieldType: EFieldType.Select,
      id: 'location',
      fieldName: 'location',
      label: 'Location',
      selectConfig: {
        optionsDropdown: LOCATION_DATA,
      },
      validators: [Validators.required],
    },
  };
