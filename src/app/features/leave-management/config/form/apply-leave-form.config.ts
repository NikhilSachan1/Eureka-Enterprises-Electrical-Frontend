import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType, EDateSelectionMode } from '../../../../shared/types/form-input.types';

export const APPLY_LEAVE_INPUT_FIELDS_CONFIG: IFormConfig = {
  dateRange: {
    fieldType: EFieldType.Date,
    id: 'dateRange',
    fieldName: 'dateRange',
    label: 'Leave Date Range',
    validators: [Validators.required],
    dateConfig: {
      selectionMode: EDateSelectionMode.Range,
      minDate: new Date(),
      showButtonBar: true,
      numberOfMonths: 2
    }
  },
  comment: {
    fieldType: EFieldType.TextArea,
    id: 'comment',
    fieldName: 'comment',
    label: 'Comment',
    validators: [Validators.required, Validators.maxLength(500)]
  }
}; 