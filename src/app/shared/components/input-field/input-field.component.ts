import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  ViewChild,
  AfterViewInit,
  DestroyRef,
  computed,
  signal,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  FormsModule,
} from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  FileRemoveEvent,
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { InputOtpModule } from 'primeng/inputotp';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonComponent } from '@shared/components/button/button.component';
import {
  EButtonActionType,
  EButtonVariant,
  ECalendarView,
  ECheckBoxAndRadioAlign,
  EDateIconDisplay,
  EDateSelectionMode,
  EDataType,
  EFileMode,
  EHourFormat,
  EMultiSelectDisplayType,
  EUpAndDownButtonLayout,
  ETextCase,
  IInputFieldsConfig,
  IGalleryInputData,
  IButtonConfig,
  IOptionDropdown,
  InputEventLike,
  CheckboxEventLike,
} from '@shared/types';
import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import { AppConfigurationService, GalleryService } from '@shared/services';
import {
  arrayToString,
  fileFormatValidator,
  fileLimitValidator,
  fileSizeValidator,
  filterOptionsByIncludeExclude,
  stringToArray,
  toLowerCase,
  toSentenceCase,
  toTitleCase,
  toUpperCase,
} from '@shared/utility';
import { ImageModule } from 'primeng/image';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-input-field',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    FloatLabelModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    PasswordModule,
    CheckboxModule,
    RadioButtonModule,
    FileUploadModule,
    TextareaModule,
    InputOtpModule,
    AutoCompleteModule,
    ButtonComponent,
    ImageModule,
  ],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFieldComponent implements OnInit, AfterViewInit {
  private readonly galleryService = inject(GalleryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appConfigurationService = inject(AppConfigurationService);

  ALL_DATA_TYPES = EDataType;
  ALL_UP_AND_DOWN_BUTTON_LAYOUTS = EUpAndDownButtonLayout;
  ALL_MULTI_SELECT_DISPLAY_TYPES = EMultiSelectDisplayType;
  ALL_DATE_ICON_DISPLAY_TYPES = EDateIconDisplay;
  ALL_DATE_SELECTION_MODES = EDateSelectionMode;
  ALL_HOUR_FORMATS = EHourFormat;
  ALL_CALENDAR_VIEWS = ECalendarView;
  ALL_CHECKBOX_AND_RADIO_ALIGN = ECheckBoxAndRadioAlign;
  ALL_FILE_MODES = EFileMode;
  ALL_DROPDOWN_CONFIG = APP_CONFIG.DROPDOWN_CONFIG;
  ALL_MEDIA_ICONS = ICONS;
  ALL_BUTTON_ACTION_TYPES = EButtonActionType;
  ALL_BUTTON_VARIANTS = EButtonVariant;
  ALL_TEXT_CASES = ETextCase;

  totalUploadedSize = 0;

  @ViewChild('fileUploadRef') fileUploadRef?: FileUpload;

  /** When provided = form mode (reactive form). When not provided = standalone mode (use fieldValue + onFieldChange). */
  formGroup = input<FormGroup | undefined>(undefined);
  inputFieldConfig = input.required<IInputFieldsConfig>();
  /** For standalone mode: external value binding */
  fieldValue = input<unknown>(undefined);
  /** For standalone mode: show invalid state */
  isFieldInvalidInput = input<boolean>(false);

  /** For standalone mode: optional error message to show when invalid */
  standaloneErrorMessage = input<string | undefined>(undefined);

  /** Optional: bind to a value that changes when form is submitted (e.g. submitted()) so per-field errors update after markAllAsTouched(). */
  externalValidationTrigger = input<unknown>(undefined);

  onFieldChange = output<unknown>();

  /** True when used with a form (formGroup provided). */
  isFormMode = computed(() => !!this.formGroup());

  /** In form mode: synced from control; in standalone: from fieldValue/defaultValue */
  formControlValue = signal<unknown>(undefined);
  effectiveValue = computed(() =>
    this.isFormMode()
      ? this.formControlValue()
      : (this.fieldValue() ?? this.inputFieldConfig().defaultValue)
  );

  /** Bump this when control validation/touched state changes so template updates (OnPush). */
  private validationTrigger = signal(0);

  /** Invalid state: from form control when form mode, else from isFieldInvalidInput */
  isFieldInvalidDisplay = computed(() => {
    this.validationTrigger(); // re-run when control value/status changes
    this.externalValidationTrigger(); // re-run when parent e.g. submits (markAllAsTouched)
    return this.isFormMode()
      ? this.checkIsFieldInvalid(this.inputFieldConfig().fieldName)
      : this.isFieldInvalidInput();
  });

  /** Config with resolved dropdown options (dynamic/dependent) for SELECT/MULTI_SELECT */
  resolvedInputFieldConfig = computed(() => {
    const config = this.inputFieldConfig();
    const opts = this.getDropdownOptions();
    const displayOptions =
      opts.length > 0
        ? opts
        : [{ label: 'No data found', value: '', disabled: true }];
    if (config.fieldType === EDataType.SELECT && config.selectConfig) {
      return {
        ...config,
        selectConfig: {
          ...config.selectConfig,
          optionsDropdown: displayOptions,
        },
      };
    }
    if (
      config.fieldType === EDataType.MULTI_SELECT &&
      config.multiSelectConfig
    ) {
      return {
        ...config,
        multiSelectConfig: {
          ...config.multiSelectConfig,
          optionsDropdown: displayOptions,
        },
      };
    }
    return config;
  });

  /** Filtered suggestions for autocomplete (filtered by user query) */
  autocompleteSuggestions = signal<IOptionDropdown[]>([]);

  // Signal for dependent dropdown options (e.g., cities based on state)
  private dependentDropdownOptions = signal<IOptionDropdown[]>([]);

  // Cached validator values to avoid recalculation on every input
  private cachedMaxLength: number | null = null;
  private cachedPattern: RegExp | null = null;
  private validatorsInitialized = false;

  constructor() {
    // Standalone mode: sync file upload when fieldValue (effectiveValue) changes for ATTACHMENTS
    effect(() => {
      if (this.isFormMode()) {
        return;
      }
      const config = this.inputFieldConfig();
      const value = this.effectiveValue();
      if (config.fieldType !== EDataType.ATTACHMENTS) {
        return;
      }
      if (Array.isArray(value) && value.length === 0) {
        setTimeout(() => {
          this.fileUploadRef?.clear();
          this.totalUploadedSize = 0;
        }, 0);
      } else if (this.shouldUpdateFileUpload(value)) {
        setTimeout(() => this.updateFileUpload(value), 0);
      }
    });
  }

  ngOnInit(): void {
    const config = this.inputFieldConfig();
    const fg = this.formGroup();
    const control = fg?.get(config.fieldName);

    if (config.disabledInput && control) {
      control.disable();
    }

    // Initialize cached validator values once (used in form mode for text/textarea)
    if (!this.validatorsInitialized) {
      this.cachedMaxLength = this.extractMaxLength();
      this.cachedPattern = this.extractPattern();
      this.validatorsInitialized = true;
    }

    if (fg && control) {
      // Form mode: sync formControlValue from control and keep in sync
      this.formControlValue.set(control.value);
      control.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => {
          this.formControlValue.set(value);
          this.validationTrigger.update(v => v + 1);
        });
      // So validation errors re-render when status (valid/invalid) or touched/dirty change
      control.statusChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.validationTrigger.update(v => v + 1));

      // When form validity or any control's touched state changes (e.g. markAllAsTouched on submit), re-check
      fg.statusChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.validationTrigger.update(v => v + 1));
    }

    // Handle dependent dropdown (form mode only)
    if (fg) {
      this.setupDependentDropdown(config);
    }

    // Pre-populate autocomplete suggestions when value exists (edit / standalone)
    if (config.fieldType === EDataType.AUTOCOMPLETE && this.effectiveValue()) {
      this.autocompleteSuggestions.set(this.getAutocompleteOptions());
    }

    if (fg && config.fieldType === EDataType.ATTACHMENTS && control) {
      control.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => {
          const hasFiles = Array.isArray(value) ? value.length > 0 : !!value;
          if (!hasFiles) {
            this.fileUploadRef?.clear();
            this.totalUploadedSize = 0;
          } else {
            this.updateFileUpload(value);
          }
        });
    }
  }

  /**
   * Setup dependent dropdown - watches parent field and updates options accordingly
   */
  private setupDependentDropdown(config: IInputFieldsConfig): void {
    const dropdownConfig =
      config.fieldType === EDataType.SELECT
        ? config.selectConfig
        : config.fieldType === EDataType.MULTI_SELECT
          ? config.multiSelectConfig
          : undefined;

    const dependentConfig = dropdownConfig?.dependentDropdown;
    if (!dependentConfig) {
      return;
    }

    const {
      dependsOnField,
      optionsProviderMethod,
      resetOnParentChange = true,
    } = dependentConfig;
    const fg = this.formGroup();
    if (!fg) {
      return;
    }
    const parentControl = fg.get(dependsOnField);
    const currentControl = fg.get(config.fieldName);

    if (!parentControl) {
      console.warn(
        `Dependent dropdown: Parent field '${dependsOnField}' not found in form`
      );
      return;
    }

    // Check if the method exists on AppConfigurationService
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serviceMethod = (this.appConfigurationService as any)[
      optionsProviderMethod
    ];
    if (typeof serviceMethod !== 'function') {
      console.warn(
        `Dependent dropdown: Method '${optionsProviderMethod}' not found on AppConfigurationService`
      );
      return;
    }

    // Set initial options if parent already has a value
    const initialParentValue = parentControl.value;
    if (initialParentValue) {
      const initialOptions = (
        serviceMethod as (value: string) => IOptionDropdown[]
      ).call(this.appConfigurationService, initialParentValue);
      this.dependentDropdownOptions.set(initialOptions);
    }

    // Subscribe to parent field changes - only reset child when parent value actually changed
    // (form.disable() / enable() also emit valueChanges; we must not clear city on that)
    let previousParentValue: string | null = initialParentValue ?? null;

    parentControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parentValue: string) => {
        // Get new options based on parent value
        const newOptions = parentValue
          ? (serviceMethod as (value: string) => IOptionDropdown[]).call(
              this.appConfigurationService,
              parentValue
            )
          : [];

        this.dependentDropdownOptions.set(newOptions);

        // Reset current field only when parent value actually changed (not on disable/enable etc.)
        const parentValueChanged =
          previousParentValue !== (parentValue ?? null);
        previousParentValue = parentValue ?? null;

        if (resetOnParentChange && parentValueChanged && currentControl) {
          currentControl.setValue('');
        }
      });
  }

  ngAfterViewInit(): void {
    if (
      this.inputFieldConfig().fieldType === EDataType.ATTACHMENTS &&
      this.shouldUpdateFileUpload(this.effectiveValue())
    ) {
      this.updateFileUpload(this.effectiveValue() as File[]);
    }
  }

  /** Shared options resolution for SELECT, MULTI_SELECT, and AUTOCOMPLETE */
  private getOptionsFromDropdownLikeConfig(
    dropdownConfig: {
      dependentDropdown?: unknown;
      dynamicDropdown?: {
        moduleName: string;
        dropdownName: string;
        filterByRole?: string[];
      };
      optionsDropdown?: IOptionDropdown[];
      filterOptions?: { include?: string[]; exclude?: string[] };
    },
    dependentOptions: IOptionDropdown[] = []
  ): IOptionDropdown[] {
    let options: IOptionDropdown[] = [];

    if (dropdownConfig.dependentDropdown) {
      options = dependentOptions;
    } else if (dropdownConfig.dynamicDropdown) {
      const { moduleName, dropdownName, filterByRole } =
        dropdownConfig.dynamicDropdown;
      if (filterByRole?.length) {
        const employeeMap = new Map<string, IOptionDropdown>();
        filterByRole.forEach(role =>
          this.appConfigurationService
            .getEmployeesByRole(role)
            .forEach(employee => employeeMap.set(employee.value, employee))
        );
        options = Array.from(employeeMap.values());
      } else {
        options =
          this.appConfigurationService.getDropdown(
            moduleName,
            dropdownName
          )() ?? [];
      }
    } else {
      options = dropdownConfig.optionsDropdown ?? [];
    }

    if (dropdownConfig.filterOptions) {
      options = filterOptionsByIncludeExclude(
        options,
        dropdownConfig.filterOptions.include ?? [],
        dropdownConfig.filterOptions.exclude ?? []
      );
    }
    return options;
  }

  private getDropdownOptions(): IOptionDropdown[] {
    const config = this.inputFieldConfig();
    const dropdownConfig =
      config.fieldType === EDataType.SELECT
        ? config.selectConfig
        : config.fieldType === EDataType.MULTI_SELECT
          ? config.multiSelectConfig
          : undefined;
    if (!dropdownConfig) {
      return [];
    }
    return this.getOptionsFromDropdownLikeConfig(
      dropdownConfig,
      this.dependentDropdownOptions()
    );
  }

  getAutocompleteOptions(): IOptionDropdown[] {
    const { autocompleteConfig } = this.inputFieldConfig();
    if (!autocompleteConfig) {
      return [];
    }
    return this.getOptionsFromDropdownLikeConfig(autocompleteConfig);
  }

  onAutocompleteComplete(event: { query: string }): void {
    const options = this.getAutocompleteOptions();
    const config = this.inputFieldConfig().autocompleteConfig;
    const filterBy = config?.filterBy ?? 'label';
    const query = (event.query ?? '').trim().toLowerCase();

    const filtered = query
      ? options.filter(item => {
          const label = String(
            item[filterBy as keyof IOptionDropdown] ?? item.label ?? ''
          ).toLowerCase();
          return label.includes(query);
        })
      : options;

    this.autocompleteSuggestions.set(filtered);
  }

  /**
   * When forceSelection is false: sync typed text on blur (form: setValue; standalone: emit).
   */
  onAutocompleteBlur(event: Event): void {
    const config = this.inputFieldConfig();
    if (
      config.fieldType !== EDataType.AUTOCOMPLETE ||
      config.autocompleteConfig?.forceSelection
    ) {
      return;
    }
    const targetInput = event.target as HTMLInputElement | null;
    const typedValue = targetInput?.value?.trim() ?? '';
    if (this.isFormMode()) {
      const fg = this.formGroup();
      const control = fg?.get(config.fieldName);
      if (control && typedValue !== control.value) {
        control.setValue(typedValue, { emitEvent: true });
      }
    } else {
      this.onValueChange(typedValue);
    }
  }

  /**
   * When optionValue is 'label': ensure value is label string on select.
   */
  onAutocompleteSelect(event: { value: IOptionDropdown }): void {
    const config = this.inputFieldConfig();
    if (config.fieldType !== EDataType.AUTOCOMPLETE) {
      return;
    }
    const optionLabel = config.autocompleteConfig?.optionLabel ?? 'label';
    const optionValue = config.autocompleteConfig?.optionValue ?? 'value';
    if (optionValue !== 'label' || !event?.value) {
      this.onValueChange(event.value);
      return;
    }
    const item = event.value as unknown as Record<string, unknown>;
    const label = String(item[optionLabel] ?? event.value?.label ?? '');
    if (this.isFormMode()) {
      this.formGroup()?.get(config.fieldName)?.setValue(label, {
        emitEvent: true,
      });
    } else {
      this.onValueChange(label);
    }
  }

  onChoosingFile(chooseCallback: () => void): void {
    chooseCallback();
  }

  onRemovingSelectedFile(
    event: FileRemoveEvent,
    removeFileCallback: (event: FileRemoveEvent, index: number) => void,
    index: number
  ): void {
    removeFileCallback(event, index);
  }

  onClearAllSelectedFiles(
    event: FileRemoveEvent,
    clearCallback: (event: FileRemoveEvent) => void
  ): void {
    clearCallback(event);
    this.totalUploadedSize = 0;
    if (this.isFormMode()) {
      const fg = this.formGroup();
      fg?.get(this.inputFieldConfig().fieldName)?.setValue([]);
    } else {
      this.onValueChange([]);
    }
  }

  onFilesSelected(event: FileSelectEvent): void {
    const files = event.currentFiles;
    this.totalUploadedSize = files.reduce((acc, file) => acc + file.size, 0);
    if (this.isFormMode()) {
      const fg = this.formGroup();
      const control = fg?.get(this.inputFieldConfig().fieldName);
      if (!control) {
        return;
      }
      const { fileConfig } = this.inputFieldConfig();
      const existingValidator = control.validator;
      const fileValidators = [
        fileLimitValidator(fileConfig?.fileLimit ?? 0),
        fileSizeValidator(fileConfig?.maxFileSize ?? 0),
        fileFormatValidator(fileConfig?.acceptFileTypes ?? []),
      ];
      control.setValidators(
        existingValidator
          ? [existingValidator, ...fileValidators]
          : fileValidators
      );
      control.setValue(files);
      control.markAsDirty();
      control.updateValueAndValidity();
      this.onFieldChange.emit(true);
    } else {
      this.onFieldChange.emit(files);
    }
  }

  onFileRemoved(event: FileRemoveEvent): void {
    this.totalUploadedSize -= event.file.size;
    if (this.isFormMode()) {
      const control = this.formGroup()?.get(this.inputFieldConfig().fieldName);
      const currentFiles = (control?.value as File[]) ?? [];
      const updatedFiles = currentFiles.filter(file => file !== event.file);
      control?.setValue(updatedFiles);
    } else {
      const currentFiles = (this.effectiveValue() as File[]) ?? [];
      const updatedFiles = currentFiles.filter(file => file !== event.file);
      this.onValueChange(updatedFiles);
    }
  }

  private shouldUpdateFileUpload(files: unknown): files is File[] {
    return (
      Array.isArray(files) &&
      files.length > 0 &&
      files.every(file => file instanceof File)
    );
  }

  private updateFileUpload(files: File[]): void {
    if (!this.fileUploadRef) {
      return;
    }

    // Use requestAnimationFrame for better performance than setTimeout
    requestAnimationFrame(() => {
      if (!this.fileUploadRef) {
        return;
      }

      try {
        // Clear and set files
        this.fileUploadRef.clear();
        this.fileUploadRef.files = [...files];

        // Update total size
        this.totalUploadedSize = files.reduce(
          (sum, file) => sum + file.size,
          0
        );

        // Trigger change detection
        this.triggerFileUploadChangeDetection();
      } catch (error) {
        console.error('Failed to update file upload:', error);
      }
    });
  }

  private triggerFileUploadChangeDetection(): void {
    // Trigger PrimeNG FileUpload internal change detection
    const fileUploadCd = this.fileUploadRef?.['cd'];
    if (fileUploadCd && typeof fileUploadCd.detectChanges === 'function') {
      fileUploadCd.markForCheck();
      fileUploadCd.detectChanges();
    }
  }

  openFilePreview(files: File | File[]): void {
    if (!files) {
      return;
    }

    const filesArray: File[] = Array.isArray(files) ? files : [files];

    if (!filesArray.length) {
      return;
    }

    const mediaItems: IGalleryInputData[] = filesArray.map(file => {
      return {
        mediaKey: file.name,
        actualMediaUrl: URL.createObjectURL(file),
        thumbnailMediaUrl: URL.createObjectURL(file),
      };
    });

    this.galleryService.show(mediaItems);
  }

  checkIsFieldInvalid(fieldName: string): boolean {
    const fg = this.formGroup();
    if (!fg) {
      return false;
    }
    const control = fg.get(fieldName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  onChange(): void {
    this.onFieldChange.emit(true);
  }

  /** Mark form control as touched on blur so validation errors can show (invalid + touched). */
  onBlur(): void {
    if (!this.isFormMode()) {
      return;
    }
    const control = this.formGroup()?.get(this.inputFieldConfig().fieldName);
    if (control && !control.touched) {
      control.markAsTouched();
      this.validationTrigger.update(v => v + 1);
    }
  }

  /**
   * Single handler for value changes: form mode = update control; standalone = emit value.
   * Event can be input event, checkbox event, or raw value.
   */
  onValueChange(eventOrValue: unknown): void {
    let value: unknown;
    if (this.isInputEvent(eventOrValue)) {
      value = eventOrValue.target.value;
    } else if (this.isCheckboxEvent(eventOrValue)) {
      value = eventOrValue.checked;
    } else {
      value = eventOrValue;
    }

    if (this.isFormMode()) {
      const config = this.inputFieldConfig();
      const fg = this.formGroup();
      const control = fg?.get(config.fieldName);
      if (!control) {
        return;
      }

      let valueToSet = value;
      // Range datepicker: ngModelChange gives [start, end] or [start, null]. Use as-is. Single Date fallback -> [date, null].
      if (
        config.fieldType === EDataType.DATE &&
        config.dateConfig?.selectionMode === EDateSelectionMode.Range
      ) {
        const isRangeArray =
          Array.isArray(valueToSet) &&
          (valueToSet.length === 1 || valueToSet.length === 2) &&
          (valueToSet[0] instanceof Date || valueToSet[0] === null) &&
          (valueToSet[1] === undefined ||
            valueToSet[1] instanceof Date ||
            valueToSet[1] === null);
        if (!isRangeArray && valueToSet instanceof Date) {
          valueToSet = [valueToSet, null];
        } else if (isRangeArray) {
          valueToSet = valueToSet as [Date | null, Date | null | undefined];
        }
      }
      if (
        (config.fieldType === EDataType.TEXT ||
          config.fieldType === EDataType.TEXT_AREA) &&
        typeof valueToSet === 'string'
      ) {
        if (config.applyPatternFilter !== false && this.cachedPattern) {
          const pattern = this.cachedPattern;
          valueToSet = valueToSet
            .split('')
            .filter(char => pattern.test(char))
            .join('');
        }
        if (config.textConfig?.textCase) {
          valueToSet = this.applyTextCase(
            valueToSet as string,
            config.textConfig.textCase
          );
        }
      }
      if (
        config.fieldType === EDataType.ATTACHMENTS &&
        Array.isArray(valueToSet)
      ) {
        const existingValidator = control.validator;
        const fileValidators = [
          fileLimitValidator(config.fileConfig?.fileLimit ?? 0),
          fileSizeValidator(config.fileConfig?.maxFileSize ?? 0),
          fileFormatValidator(config.fileConfig?.acceptFileTypes ?? []),
        ];
        control.setValidators(
          existingValidator
            ? [existingValidator, ...fileValidators]
            : fileValidators
        );
      }
      control.setValue(valueToSet);
      control.markAsDirty();
      control.updateValueAndValidity();
      this.formControlValue.set(valueToSet);
      this.validationTrigger.update(v => v + 1);
      this.onFieldChange.emit(true);
    } else {
      this.onFieldChange.emit(value);
    }
  }

  private isInputEvent(event: unknown): event is InputEventLike {
    return (
      typeof event === 'object' &&
      event !== null &&
      'target' in event &&
      typeof (event as InputEventLike).target === 'object' &&
      (event as InputEventLike).target !== null &&
      'value' in (event as InputEventLike).target
    );
  }

  private isCheckboxEvent(event: unknown): event is CheckboxEventLike {
    return typeof event === 'object' && event !== null && 'checked' in event;
  }

  getAllowedFileTypes(separator = ', ', forLabel = false): string {
    const { fileConfig } = this.inputFieldConfig();
    if (!fileConfig) {
      return '';
    }

    const acceptedFileTypes = fileConfig.acceptFileTypes ?? [];
    const acceptedFileTypesUpperCase = acceptedFileTypes.map(type =>
      type?.toString().toUpperCase()
    );

    if (forLabel) {
      return arrayToString(acceptedFileTypesUpperCase, separator);
    }

    const finalAcceptedFileTypes = [
      ...acceptedFileTypesUpperCase,
      ...acceptedFileTypes,
    ];

    return arrayToString(finalAcceptedFileTypes, separator);
  }

  isImageFile(file: File): boolean {
    if (!file) {
      return false;
    }

    const imageExtensions = APP_CONFIG.MEDIA_CONFIG.IMAGE;
    const extension = stringToArray(file.type, '/')[1];
    return imageExtensions.includes(extension);
  }

  formatSize(bytes: number | null | undefined): string {
    const value = bytes ?? 0;

    if (value === 0) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(value) / Math.log(k));
    const size = value / Math.pow(k, i);

    return `${size.toFixed(2)} ${units[i]}`;
  }

  getFileUploadButtonConfig(buttonName: string): Partial<IButtonConfig> {
    const config: Record<string, Partial<IButtonConfig>> = {
      viewMedia: {
        ...COMMON_ROW_ACTIONS.VIEW,
        tooltip: 'View Media',
        rounded: true,
        variant: this.ALL_BUTTON_VARIANTS.OUTLINED,
      },
      deleteMedia: {
        ...COMMON_ROW_ACTIONS.DELETE,
        tooltip: 'Delete Media',
        rounded: true,
        variant: this.ALL_BUTTON_VARIANTS.OUTLINED,
      },
      uploadMedia: {
        id: this.ALL_BUTTON_ACTION_TYPES.VIEW,
        icon: this.ALL_MEDIA_ICONS.COMMON.CLOUD_UPLOAD,
        tooltip: 'Upload Media',
        rounded: true,
        variant: this.ALL_BUTTON_VARIANTS.OUTLINED,
      },
    } as const;

    return config[buttonName] ?? {};
  }

  getErrorMessage(fieldName: string): string {
    const fg = this.formGroup();
    if (!fg) {
      return '';
    }
    const control = fg.get(fieldName);
    if (!control) {
      return '';
    }

    const { errors } = control;
    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'This field is required';
    }
    if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['min']) {
      return `Minimum value is ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `Maximum value is ${errors['max'].max}`;
    }
    if (errors['hasSpecialChars']) {
      return 'Text should not contain any special characters';
    }
    if (errors['fileLimit']) {
      return `You can upload a maximum ${errors['fileLimitValue']} files.`;
    }
    if (errors['fileSize']) {
      return `You can upload a maximum  ${this.formatSize(errors['fileSizeValue'])} files.`;
    }
    if (errors['fileFormat']) {
      return `Only allowed file types are ${arrayToString(errors['fileFormatValue'], ', ')}`;
    }
    if (errors['pattern']) {
      return errors['pattern'];
    }

    return 'Invalid value';
  }

  /**
   * Max length for native maxlength attribute when preventMaxLength is true (prevents typing beyond limit).
   * Returns null when preventMaxLength is false/undefined so no attribute is set and validation error shows instead.
   */
  getMaxLengthAttribute(): number | null {
    const config = this.inputFieldConfig();
    if (config.preventMaxLength !== true || this.cachedMaxLength === null) {
      return null;
    }
    return this.cachedMaxLength;
  }

  /**
   * Extracts maxlength requiredLength from validators (cached on init).
   */
  private extractMaxLength(): number | null {
    const { validators } = this.inputFieldConfig();
    if (!validators?.length) {
      return null;
    }
    const testControl = { value: 'x'.repeat(1000) } as AbstractControl;
    for (const validator of validators) {
      const wrappedValidator = validator as ValidatorFn & {
        __originalValidator?: ValidatorFn;
      };
      const originalValidator =
        wrappedValidator.__originalValidator ?? validator;
      const result = originalValidator(testControl) as Record<
        string,
        unknown
      > | null;
      const maxlengthError = result?.['maxlength'];
      if (
        maxlengthError &&
        typeof maxlengthError === 'object' &&
        'requiredLength' in maxlengthError
      ) {
        return maxlengthError.requiredLength as number;
      }
    }
    return null;
  }

  /**
   * Extracts pattern from validators (cached on init)
   * Extracts all allowed characters from regex pattern including character classes and literal characters
   */
  private extractPattern(): RegExp | null {
    const { validators } = this.inputFieldConfig();
    if (!validators?.length) {
      return null;
    }

    const testControl = { value: '!@#$%' } as AbstractControl;
    for (const validator of validators) {
      // Check if validator is wrapped with withCustomMessage
      const wrappedValidator = validator as ValidatorFn & {
        __originalValidator?: ValidatorFn;
      };
      const originalValidator =
        wrappedValidator.__originalValidator ?? validator;

      const result = originalValidator(testControl);
      const patternError = result?.['pattern'];
      if (
        patternError &&
        typeof patternError === 'object' &&
        'requiredPattern' in patternError
      ) {
        const patternStr = patternError.requiredPattern as string;
        const allowedChars = this.extractAllowedCharacters(patternStr);
        if (allowedChars) {
          return new RegExp(`^[${allowedChars}]$`);
        }
      }
    }
    return null;
  }

  /**
   * Extracts all allowed characters from regex pattern
   * Handles character classes [a-z], literal characters, and special characters
   */
  private extractAllowedCharacters(patternStr: string): string | null {
    if (!patternStr) {
      return null;
    }

    const allowedCharsSet = new Set<string>();

    // Extract all character classes [content]
    const charClassRegex = /\[([^\]]+)\]/g;
    let match;
    while ((match = charClassRegex.exec(patternStr)) !== null) {
      const charClass = match[1];
      // Parse character class content
      this.parseCharacterClass(charClass, allowedCharsSet);
    }

    // Extract literal characters that are not inside character classes
    // Remove character classes from pattern to find literals
    const patternWithoutClasses = patternStr.replace(/\[[^\]]+\]/g, '');

    // Extract literal space characters (not inside character classes and not escaped)
    // Check for spaces that are not preceded by backslash
    for (let i = 0; i < patternWithoutClasses.length; i++) {
      if (
        patternWithoutClasses[i] === ' ' &&
        (i === 0 || patternWithoutClasses[i - 1] !== '\\')
      ) {
        allowedCharsSet.add(' ');
      }
    }

    // Extract literal characters (excluding regex special characters like ^, $, +, *, ?, etc.)
    const literalChars = patternWithoutClasses.match(/[a-zA-Z0-9@._%+-]/g);
    if (literalChars) {
      literalChars.forEach(char => allowedCharsSet.add(char));
    }

    // Also check for escaped special characters
    const escapedChars = patternWithoutClasses.match(/\\([@._%+-])/g);
    if (escapedChars) {
      escapedChars.forEach(escaped => {
        const char = escaped[1]; // Get the character after backslash
        allowedCharsSet.add(char);
      });
    }

    if (allowedCharsSet.size === 0) {
      return null;
    }

    // Convert set to sorted string, escaping special regex characters
    const sortedChars = Array.from(allowedCharsSet).sort();
    return sortedChars
      .map(char => {
        // Escape special regex characters in character class
        if ('-]\\^'.includes(char)) {
          return `\\${char}`;
        }
        return char;
      })
      .join('');
  }

  /**
   * Parses a character class content and adds allowed characters to the set
   * Handles ranges like a-z, A-Z, 0-9, \s (whitespace), and individual characters
   */
  private parseCharacterClass(
    charClass: string,
    allowedCharsSet: Set<string>
  ): void {
    let i = 0;
    while (i < charClass.length) {
      // Handle \s (whitespace) escape sequence
      if (
        charClass[i] === '\\' &&
        i + 1 < charClass.length &&
        charClass[i + 1] === 's'
      ) {
        // \s represents whitespace characters (space, tab, newline, etc.)
        // For input filtering, we'll allow space character
        allowedCharsSet.add(' ');
        i += 2;
      }
      // Check for character range like a-z, A-Z, 0-9
      else if (
        i + 2 < charClass.length &&
        charClass[i + 1] === '-' &&
        charClass[i] <= charClass[i + 2]
      ) {
        const start = charClass[i].charCodeAt(0);
        const end = charClass[i + 2].charCodeAt(0);
        for (let code = start; code <= end; code++) {
          allowedCharsSet.add(String.fromCharCode(code));
        }
        i += 3;
      } else {
        // Individual character
        const char = charClass[i];
        // Handle escaped characters (except \s which is handled above)
        if (char === '\\' && i + 1 < charClass.length) {
          const nextChar = charClass[i + 1];
          // Handle other escape sequences
          if (nextChar === 'n') {
            allowedCharsSet.add('\n');
          } else if (nextChar === 't') {
            allowedCharsSet.add('\t');
          } else {
            allowedCharsSet.add(nextChar);
          }
          i += 2;
        } else {
          allowedCharsSet.add(char);
          i++;
        }
      }
    }
  }

  private applyTextCase(value: string, textCase: ETextCase): string {
    return textCase === ETextCase.UPPERCASE
      ? toUpperCase(value)
      : textCase === ETextCase.LOWERCASE
        ? toLowerCase(value)
        : textCase === ETextCase.TITLECASE
          ? toTitleCase(value)
          : textCase === ETextCase.SENTENCECASE
            ? toSentenceCase(value)
            : value;
  }
}
