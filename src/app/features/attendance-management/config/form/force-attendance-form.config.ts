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
        { value: 'James Butt', key: 'james_butt' },
        { value: 'Mary Smith', key: 'mary_smith' },
        { value: 'John Doe', key: 'john_doe' },
        { value: 'Sara Lee', key: 'sara_lee' },
        { value: 'Michael Johnson', key: 'michael_johnson' },
        { value: 'Emily Davis', key: 'emily_davis' },
        { value: 'David Wilson', key: 'david_wilson' },
        { value: 'Linda Brown', key: 'linda_brown' }
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
        { value: 'Present', key: 'present' },
        { value: 'Absent', key: 'absent' },
        { value: 'Leave', key: 'leave' },
        { value: 'Holiday', key: 'holiday' }
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
    textAreaConfig: {
      rows: 4,
      cols: 30,
      autoResize: true
    }
  }
}; 