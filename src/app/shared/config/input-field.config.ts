import { Validators } from '@angular/forms';
import { APP_CONFIG } from '@core/config';
import {
  EAutocomplete,
  ECalendarView,
  ECheckBoxAndRadioAlign,
  EDateIconDisplay,
  EDateSelectionMode,
  EFieldSize,
  EFileMode,
  EFloatLabelVariant,
  EInputNumberMode,
  EMultiSelectDisplayType,
  ESpinnerMode,
  ETextCase,
  EUpAndDownButtonLayout,
  IInputFieldsConfig,
} from '@shared/types';

export const DEFAULT_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  autocomplete: EAutocomplete.Off,
  haveFullWidth: true,
  fieldSize: EFieldSize.Large,
  floatLabelVariant: EFloatLabelVariant.On,
  disabledInput: false,
  readonlyInput: false,
  showStandardLabel: false,
  placeholder: 'Search',
};

export const DEFAULT_NUMBER_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  ...DEFAULT_INPUT_FIELD_CONFIG,
  numberConfig: {
    mode: EInputNumberMode.Decimal,
    allowNumberFormatting: true,
    showUpAndDownButtons: false,
    upAndDownButtonLayout: EUpAndDownButtonLayout.Horizontal,
    spinnerMode: ESpinnerMode.Horizontal,
    locale: 'en-IN',
    step: 1,
  },
};

export const DEFAULT_SELECT_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  ...DEFAULT_INPUT_FIELD_CONFIG,
  selectConfig: {
    showCheckmark: true,
    haveFilter: true,
    filterBy: 'label',
    showClearButton: true,
    isEditable: false,
    virtualScroll: false,
    virtualScrollItemSize: 10,
    optionLabel: 'label',
    optionValue: 'value',
    loading: false,
    optionDisabled: 'disabled',
  },
};

export const DEFAULT_AUTOCOMPLETE_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> =
  {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    autocompleteConfig: {
      optionLabel: 'label',
      optionValue: 'value',
      filterBy: 'label',
      showClearButton: true,
      forceSelection: false,
    },
  };

export const DEFAULT_MULTI_SELECT_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> =
  {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    multiSelectConfig: {
      haveFilter: true,
      filterBy: 'label',
      showClearButton: true,
      showToggleAll: true,
      display: EMultiSelectDisplayType.Chip,
      optionLabel: 'label',
      optionValue: 'value',
      loading: false,
      optionDisabled: 'disabled',
    },
  };

export const DEFAULT_DATE_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  ...DEFAULT_INPUT_FIELD_CONFIG,
  readonlyInput: true,
  dateConfig: {
    dateFormat: APP_CONFIG.DATE_FORMATS.DEFAULT_CALENDAR,
    showCalendarIcon: true,
    iconDisplay: EDateIconDisplay.Input,
    timeOnly: false,
    showButtonBar: true,
    selectionMode: EDateSelectionMode.Single,
    numberOfMonths: 1,
    calendarView: ECalendarView.Date,
    touchUI: true,
    rangeAutoCompleteEndWithStart: true,
  },
};

export const DEFAULT_PASSWORD_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> =
  {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    passwordConfig: {
      feedback: true,
      promptLabel: 'Choose a password',
      weakLabel: 'Too simple',
      mediumLabel: 'Average complexity',
      strongLabel: 'Complex password',
      toggleMask: true,
      strongRegex:
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,}$',
      mediumRegex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$',
    },
  };

export const DEFAULT_CHECKBOX_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> =
  {
    fieldSize: EFieldSize.Large,
    checkboxConfig: {
      binary: true,
      indeterminate: false,
      align: ECheckBoxAndRadioAlign.Horizontal,
    },
  };

export const DEFAULT_RADIO_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  fieldSize: EFieldSize.Large,
  radioConfig: {
    align: ECheckBoxAndRadioAlign.Horizontal,
  },
};

export const DEFAULT_FILE_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  fileConfig: {
    customUpload: true,
    multipleFiles: true,
    maxFileSize: 1024 * 1024 * 10, // 10MB
    mode: EFileMode.Advanced,
    automaticUpload: false,
    chooseLabel: 'Upload Attachment(s)',
    cancelLabel: 'Cancel',
    showUploadButton: false,
    showCancelButton: false,
    fileLimit: 10,
  },
};

export const DEFAULT_TEXT_AREA_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> =
  {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    textAreaConfig: {
      rows: 3,
      autoResize: false,
    },
    validators: [Validators.maxLength(500)],
  };

export const DEFAULT_INDIVIDUAL_NUMBER_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> =
  {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    individualNumberConfig: {
      length: 4,
      integerOnly: true,
      separators: [
        {
          position: 2,
          content: '/',
        },
      ],
    },
  };

export const DEFAULT_TEXT_INPUT_FIELD_CONFIG: Partial<IInputFieldsConfig> = {
  ...DEFAULT_INPUT_FIELD_CONFIG,
  textConfig: {
    textCase: ETextCase.NONE,
  },
};
