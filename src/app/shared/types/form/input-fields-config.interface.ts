import { ValidatorFn } from '@angular/forms';
import {
  EAutocomplete,
  ECalendarView,
  ECheckBoxAndRadioAlign,
  ECurrencyDisplay,
  EDataType,
  EDateIconDisplay,
  EDateSelectionMode,
  EFieldSize,
  EFileMode,
  EFloatLabelVariant,
  EHourFormat,
  EInputNumberMode,
  EMultiSelectDisplayType,
  ESpinnerMode,
  ETextCase,
  EUpAndDownButtonLayout,
} from '@shared/types';
import { EEditorToolbarOption } from '@shared/types/editor/editor.enum';

export interface IInputFieldsConfig {
  fieldType: EDataType;
  id: string;
  autocomplete?: EAutocomplete;
  readonlyInput?: boolean;
  disabledInput?: boolean;
  showStandardLabel?: boolean;
  haveFullWidth: boolean;
  fieldSize: EFieldSize;
  fieldName: string;
  floatLabelVariant: EFloatLabelVariant;
  label: string;
  /** Optional helper line below the control (e.g. which fields a search applies to). */
  hint?: string;
  placeholder?: string;
  defaultValue?: unknown;
  numberConfig?: Partial<IInputNumberFieldConfig>;
  selectConfig?: Partial<ISelectFieldConfig>;
  autocompleteConfig?: Partial<IAutocompleteFieldConfig>;
  multiSelectConfig?: Partial<IMultiSelectFieldConfig>;
  dateConfig?: Partial<IDateFieldConfig>;
  passwordConfig?: Partial<IPasswordFieldConfig>;
  checkboxConfig?: Partial<ICheckboxFieldConfig>;
  radioConfig?: Partial<IRadioFieldConfig>;
  fileConfig?: Partial<IFileFieldConfig>;
  textAreaConfig?: Partial<ITextAreaFieldConfig>;
  editorConfig?: Partial<IEditorFieldConfig>;
  textConfig?: Partial<ITextFieldConfig>;
  individualNumberConfig?: Partial<IIndividualNumberFieldConfig>;
  validators?: ValidatorFn[];
  conditionalValidators?: IConditionalValidator[];
}

export interface IInputNumberFieldConfig {
  mode: EInputNumberMode;
  minimumBoundaryValue: number;
  maximumBoundaryValue: number;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
  allowNumberFormatting: boolean;
  locale: string;
  currencyDisplay: ECurrencyDisplay;
  currency: string;
  prefix: string;
  suffix: string;
  showUpAndDownButtons: boolean;
  upAndDownButtonLayout: EUpAndDownButtonLayout;
  spinnerMode: ESpinnerMode;
  step: number;
  minimumInputLength?: number;
  maximumInputLength?: number;
}

export interface ISelectFieldConfig {
  optionsDropdown?: IOptionDropdown[];
  optionLabel: string;
  optionValue?: string;
  showCheckmark: boolean;
  haveFilter: boolean;
  filterBy: string;
  showClearButton: boolean;
  isEditable: boolean;
  virtualScroll: boolean;
  virtualScrollItemSize: number;
  loading?: boolean;
  optionDisabled?: string;
  dynamicDropdown?: {
    moduleName: string;
    dropdownName: string;
    filterByRole?: string[]; // Filter employees by roles (e.g., ['TECHNICIAN', 'ADMIN'])
  };
  dependentDropdown?: {
    /** The field name this dropdown depends on (e.g., 'state') */
    dependsOnField: string;
    /** Optional: parent field label for empty-state hint (e.g. "State"). Falls back from `dependsOnField` if omitted. */
    dependsOnFieldLabel?: string;
    /** The method name in AppConfigurationService to get options (e.g., 'getCitiesByState') */
    optionsProviderMethod: string;
    /** Whether to reset this field when parent field changes (default: true) */
    resetOnParentChange?: boolean;
  };
  filterOptions?: {
    include?: string[];
    exclude?: string[];
  };
}

export interface IAutocompleteFieldConfig {
  optionsDropdown?: IOptionDropdown[];
  optionLabel: string;
  optionValue?: string;
  filterBy: string;
  showClearButton: boolean;
  forceSelection?: boolean;
  dynamicDropdown?: {
    moduleName: string;
    dropdownName: string;
    filterByRole?: string[];
  };
  filterOptions?: {
    include?: string[];
    exclude?: string[];
  };
}

export interface IMultiSelectFieldConfig {
  optionsDropdown?: IOptionDropdown[];
  optionLabel: string;
  optionValue?: string;
  maxSelectedLabels: number;
  haveFilter: boolean;
  filterBy: string;
  loading?: boolean;
  showToggleAll: boolean;
  display: string | EMultiSelectDisplayType;
  showClearButton: boolean;
  optionDisabled?: string;
  virtualScroll?: boolean;
  virtualScrollItemSize?: number;
  dynamicDropdown?: {
    moduleName: string;
    dropdownName: string;
    filterByRole?: string[]; // Filter employees by roles (e.g., ['TECHNICIAN', 'ADMIN'])
  };
  /**
   * Dependent dropdown configuration - options depend on another field's value
   * Example: City dropdown depends on State selection
   */
  dependentDropdown?: {
    /** The field name this dropdown depends on (e.g., 'state') */
    dependsOnField: string;
    /** Optional: parent field label for empty-state hint (e.g. "State"). Falls back from `dependsOnField` if omitted. */
    dependsOnFieldLabel?: string;
    /** The method name in AppConfigurationService to get options (e.g., 'getCitiesByState') */
    optionsProviderMethod: string;
    /** Whether to reset this field when parent field changes (default: true) */
    resetOnParentChange?: boolean;
  };
  filterOptions?: {
    include?: string[];
    exclude?: string[];
  };
}

export interface IDateFieldConfig {
  dateFormat: string;
  showCalendarIcon: boolean;
  iconDisplay: EDateIconDisplay;
  timeOnly: boolean;
  minDate: Date;
  maxDate: Date;
  showButtonBar: boolean;
  selectionMode: EDateSelectionMode;
  showTime: boolean;
  hourFormat: EHourFormat;
  numberOfMonths: number;
  calendarView: ECalendarView;
  touchUI: boolean;
}

export interface IPasswordFieldConfig {
  feedback: boolean;
  promptLabel: string;
  weakLabel: string;
  mediumLabel: string;
  strongLabel: string;
  toggleMask: boolean;
  strongRegex: string;
  mediumRegex: string;
}

export interface ICheckboxFieldConfig {
  options: IOptionDropdown[];
  binary: boolean;
  indeterminate: boolean;
  align: ECheckBoxAndRadioAlign;
}

export interface IRadioFieldConfig {
  options: IOptionDropdown[];
  align: ECheckBoxAndRadioAlign;
}

export interface IFileFieldConfig {
  customUpload: boolean;
  multiple: boolean;
  accept: string;
  maxFileSize: number;
  multipleFiles: boolean;
  mode: EFileMode;
  acceptFileTypes: string[];
  automaticUpload: boolean;
  chooseLabel: string;
  cancelLabel: string;
  showUploadButton: boolean;
  showCancelButton: boolean;
  fileLimit: number;
}

export interface ITextAreaFieldConfig {
  rows: number;
  cols: number;
  autoResize: boolean;
}

export interface IEditorToolbarFilter {
  include?: EEditorToolbarOption[];
  exclude?: EEditorToolbarOption[];
}

export interface IEditorFieldConfig {
  height?: string;
  toolbarFilter?: IEditorToolbarFilter;
}

export interface ITextFieldConfig {
  textCase: ETextCase;
  minimumInputLength?: number;
  maximumInputLength?: number;
  /**
   * Global regex: each match is removed while typing (`String#replace`).
   * Example: `/\\D/g` keeps digits only. Presets: `TEXT_INPUT_ACCEPT_STRIP` in `@shared/constants`.
   */
  regex?: RegExp;
}

export interface IOptionDropdown<T = unknown> {
  label: string;
  value: string;
  disabled?: boolean;
  data?: T;
}

export interface IIndividualNumberFieldConfig {
  length: number;
  integerOnly: boolean;
  separators?: IInputSeparator[];
}

export interface IInputSeparator {
  position: number;
  content: string;
}

export interface InputEventLike {
  target: {
    value: unknown;
  };
}

export interface CheckboxEventLike {
  checked: unknown;
}

export interface IConditionalValidator {
  dependsOn?: string;
  validators: ValidatorFn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shouldApply: (value: any, context?: Record<string, unknown>) => boolean;
  resetOnFalse?: boolean;
  dependsOnStep?: string | number;
}
