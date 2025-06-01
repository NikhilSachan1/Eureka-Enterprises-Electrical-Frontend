import { Validators } from '@angular/forms';
import { EAutocomplete, ECalendarView, EDateIconDisplay, EFieldSize, EFieldType, EFloatLabelVariant, EInputNumberMode, EMultiSelectDisplayType, EUpAndDownButtonLayout, IFormConfig } from '../../../shared/models/input-fields-config.model';
import { noSpecialCharactersValidator } from '../../../shared/utility/validators.utils';

export const ADD_EMPLOYEE_INPUT_FIELDS_CONFIG: IFormConfig = {
  fname: {
    fieldType: EFieldType.Text,
    id: 'firstName',
    autocomplete: EAutocomplete.Off,
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'fname',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'First Name',
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(50), noSpecialCharactersValidator()],
  },
  aadharNumber: {
    fieldType: EFieldType.Number,
    id: 'aadharNumber',
    autocomplete: EAutocomplete.Off,
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'aadharNumber',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'Aadhar Number',
    validators: [Validators.required, Validators.minLength(12), Validators.maxLength(12)],
    numberConfig: {
      showUpAndDownButtons: true,
      step: 1,
    }
  },
  role: {
    fieldType: EFieldType.Select,
    id: 'role',
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'role',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'Role',
    selectConfig: {
      optionsDropdown: [{value: 'Admin', key: 'admin'}, {value: 'Employee', key: 'employee'}],
      optionLabel: 'value',
      showCheckmark: true,
      haveFilter: true,
      filterBy: 'value',
    }
  },
  workOn: {
    fieldType: EFieldType.MultiSelect,
    id: 'workOn',
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'workOn',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'Work On',
    multiSelectConfig: {
      optionsDropdown: [{value: 'Admin', key: 'admin'}, {value: 'Employee', key: 'employee'}],
      optionLabel: 'value',
      haveFilter: true,
      filterBy: 'value',
      loading: false,
      showToggleAll: true,
      selectAll: true,
      display: EMultiSelectDisplayType.Chip,
      showClearButton: true,
    }
  },
  dob: {
    fieldType: EFieldType.Date,
    id: 'dob',
    haveFullWidth: true,
    fieldSize: EFieldSize.Large,
    fieldName: 'dob',
    floatLabelVariant: EFloatLabelVariant.On,
    label: 'Date of Birth',
    dateConfig: {
      iconDisplay: EDateIconDisplay.Input,
      timeOnly: false,
      showButtonBar: true,
      calendarView: ECalendarView.Date,
      numberOfMonths: 1,
    }
  }
};
