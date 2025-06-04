import { ValidatorFn } from "@angular/forms";

export interface IFormConfig {
  [key: string]: Partial<IInputFieldsConfig>;
}

export interface IInputFieldsConfig {
  fieldType: string;
  id: string;
  autocomplete?: EAutocomplete;
  readonlyInput?: boolean;
  disabledInput?: boolean;
  haveFullWidth: boolean;
  fieldSize: EFieldSize;
  fieldName: string;
  floatLabelVariant: EFloatLabelVariant;
  label: string;
  numberConfig?: Partial<IInputNumberFieldConfig>;
  selectConfig?: Partial<ISelectFieldConfig>;
  multiSelectConfig?: Partial<IMultiSelectFieldConfig>;
  dateConfig?: Partial<IDateFieldConfig>;
  passwordConfig?: Partial<IPasswordFieldConfig>;
  checkboxConfig?: Partial<ICheckboxFieldConfig>;
  radioConfig?: Partial<IRadioFieldConfig>;
  fileConfig?: Partial<IFileFieldConfig>;
  validators?: ValidatorFn[];
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
}

export interface ISelectFieldConfig {
  optionsDropdown: IOptionDropdown[];
  optionLabel: string;
  showCheckmark: boolean;
  haveFilter: boolean;
  filterBy: string;
  showClearButton: boolean;
  isEditable: boolean;
  virtualScroll: boolean;
  virtualScrollItemSize: number;
  loading: boolean;
}

export interface IMultiSelectFieldConfig {
  optionsDropdown: IOptionDropdown[];
  optionLabel: string;
  maxSelectedLabels: number;
  haveFilter: boolean;
  filterBy: string;
  loading: boolean;
  showToggleAll: boolean;
  selectAll: boolean;
  display: string | EMultiSelectDisplayType;
  showClearButton: boolean;
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
  acceptFileTypes: string;
  automaticUpload: boolean;
  chooseLabel: string;
  cancelLabel: string;
  showUploadButton: boolean;
  showCancelButton: boolean;
}

export enum EFileMode {
  Basic = 'basic',
  Advanced = 'advanced',
}

export enum EHourFormat {
  Twelve = '12',
  TwentyFour = '24',
}

export enum ECalendarView {
  Date = 'date',
  Month = 'month',
  Year = 'year',
}

export interface IOptionDropdown {
  value: string;
  key: string;
}

export enum EFieldType {
  Text = 'text',
  Number = 'number',
  Select = 'select',
  MultiSelect = 'multiselect',
  Date = 'date',
  Password = 'password',
  Checkbox = 'checkbox',
  Radio = 'radio',
  File = 'file',
}

export enum EFloatLabelVariant {
  In = 'in',
  Over = 'over',
  On = 'on',
}

export enum EFieldSize {
  Small = 'small',
  Large = 'large',
}

export enum EAutocomplete {
  Off = 'off',
  On = 'on',
}

export enum EInputNumberMode {
  Decimal = 'decimal',
  Currency = 'currency',
}

export enum ECurrencyDisplay {
  Code = 'code',
  Symbol = 'symbol',
  Name = 'name',
}

export enum EUpAndDownButtonLayout {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
  Default = 'stacked',
}

export enum ESpinnerMode {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum EMultiSelectDisplayType {
  Chip = 'chip',
  Comma = 'comma',
}

export enum EDateIconDisplay {
  Input = 'input',
  Button = 'button',
}

export enum EDateSelectionMode {
  Single = 'single',
  Multiple = 'multiple',
  Range = 'range',
}

export enum ECheckBoxAndRadioAlign {
  Horizontal = 'row',
  Vertical = 'col',
}