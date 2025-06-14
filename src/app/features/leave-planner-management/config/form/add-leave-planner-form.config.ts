import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType } from '../../../../shared/types/form-input.types';

export const ADD_LEAVE_PLANNER_INPUT_FIELDS_CONFIG: IFormConfig = {
  financialYear: {
    fieldType: EFieldType.Select,
    id: 'financialYear',
    fieldName: 'financialYear',
    label: 'Financial Year (FY)',
    validators: [Validators.required],
    selectConfig: {
      optionsDropdown: [
        { value: 'FY 2024-25', key: '2024-25' },
        { value: 'FY 2025-26', key: '2025-26' },
        { value: 'FY 2026-27', key: '2026-27' },
        { value: 'FY 2027-28', key: '2027-28' }
      ],
    }
  },
  casualLeaveCount: {
    fieldType: EFieldType.Number,
    id: 'casualLeaveCount',
    fieldName: 'casualLeaveCount',
    label: 'Casual Leave Count (Annual)',
    validators: [Validators.required, Validators.min(1), Validators.max(50)],
  },
  optionalLeaveCount: {
    fieldType: EFieldType.Number,
    id: 'optionalLeaveCount',
    fieldName: 'optionalLeaveCount',
    label: 'Optional Leave Count',
    validators: [Validators.required, Validators.min(1), Validators.max(20)],
  }
};

// Dynamic holiday field templates
export const HOLIDAY_NAME_FIELD_CONFIG = {
  fieldType: EFieldType.Text,
  validators: [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
};

export const HOLIDAY_DATE_FIELD_CONFIG = {
  fieldType: EFieldType.Date,
  validators: [Validators.required],
}; 