import { Validators } from '@angular/forms';
import { IFormConfig } from '../../../../shared/models/input-fields-config.model';
import { EFieldType } from '../../../../shared/types/form-input.types';

export const FORCE_ATTENDANCE_INPUT_FIELDS_CONFIG: IFormConfig = {
  employeeNames: {
    fieldType: EFieldType.MultiSelect,
    id: 'employeeNames',
    fieldName: 'employeeNames',
    label: 'Employee Names',
    validators: [Validators.required],
    multiSelectConfig: {
      optionsDropdown: [
        { label: 'James Butt', value: 'james_butt' },
        { label: 'Mary Smith', value: 'mary_smith' },
        { label: 'John Doe', value: 'john_doe' },
        { label: 'Sara Lee', value: 'sara_lee' },
        { label: 'Michael Johnson', value: 'michael_johnson' },
        { label: 'Emily Davis', value: 'emily_davis' },
        { label: 'David Wilson', value: 'david_wilson' },
        { label: 'Linda Brown', value: 'linda_brown' }
      ],
      optionLabel: 'value',
      optionValue: 'key',
      showToggleAll: true,
      haveFilter: true,
      filterBy: 'value',
      showClearButton: true,
      display: 'chip'
    }
  },
  attendanceDate: {
    fieldType: EFieldType.Date,
    id: 'attendanceDate',
    fieldName: 'attendanceDate',
    label: 'Attendance Date',
    defaultValue: new Date(),
    validators: [Validators.required],
    dateConfig: {
      dateFormat: 'dd/mm/yy',
      showCalendarIcon: true,
      showButtonBar: true,
      maxDate: new Date()
    }
  },
  attendanceStatus: {
    fieldType: EFieldType.Select,
    id: 'attendanceStatus',
    fieldName: 'attendanceStatus',
    label: 'Attendance Status',
    defaultValue: 'present',
    validators: [Validators.required],
    selectConfig: {
      optionsDropdown: [
        { label: 'Present', value: 'present' },
        { label: 'Absent', value: 'absent' },
        { label: 'Leave', value: 'leave' },
        { label: 'Holiday', value: 'holiday' }
      ],
      optionLabel: 'value',
      optionValue: 'key',
      showClearButton: true,
      haveFilter: false,
      isEditable: false
    }
  },
  comment: {
    fieldType: EFieldType.TextArea,
    id: 'comment',
    fieldName: 'comment',
    label: 'Comment',
    defaultValue: 'This is a default comment',
    validators: [Validators.maxLength(500)],
  }
}; 