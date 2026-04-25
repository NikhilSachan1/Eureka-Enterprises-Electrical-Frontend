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
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { EditorModule } from 'primeng/editor';
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
  EEditorToolbarOption,
  EFileMode,
  EHourFormat,
  EMultiSelectDisplayType,
  EUpAndDownButtonLayout,
  ETextCase,
  IEditorFieldConfig,
  IInputFieldsConfig,
  ITextFieldConfig,
  IGalleryInputData,
  IButtonConfig,
  IOptionDropdown,
  InputEventLike,
  CheckboxEventLike,
} from '@shared/types';
import { APP_CONFIG } from '@core/config';
import { AuthService } from '@features/auth-management/services/auth.service';
import {
  CONFIGURATION_KEYS,
  ICONS,
  invalidCharsPatternFromStrip,
  MODULE_NAMES,
} from '@shared/constants';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import { AppConfigurationService, GalleryService } from '@shared/services';
import {
  arrayToString,
  filterOptionsByIncludeExclude,
  stringToArray,
  toLowerCase,
  toSentenceCase,
  toTitleCase,
  toUpperCase,
} from '@shared/utility';
import { ImageModule } from 'primeng/image';
import { NgClass } from '@angular/common';

/**
 * Value for disabled-only dropdown rows (hints / "No data found").
 * Must not equal a cleared control (`''` or `null`) or PrimeNG shows the hint as the selected label.
 */
const DROPDOWN_DISABLED_ROW_VALUE = '__ee_dropdown_hint__';

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
    EditorModule,
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
  private readonly authService = inject(AuthService);

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

  /** Employee / vehicle style rows use {@link IOptionDropdown.subtitle}. */
  optionsHaveRichMetadata(options: IOptionDropdown[] | undefined): boolean {
    return (options ?? []).some(
      o => typeof o.subtitle === 'string' && o.subtitle.length > 0
    );
  }

  isRichDropdownOption(option: IOptionDropdown | null | undefined): boolean {
    return (
      !!option &&
      typeof option.subtitle === 'string' &&
      option.subtitle.length > 0
    );
  }

  getDropdownOptionLabel(
    option: IOptionDropdown,
    optionLabelKey: string | undefined
  ): string {
    const key = (optionLabelKey ?? 'label') as keyof IOptionDropdown;
    const raw = option[key];
    return typeof raw === 'string' ? raw : String(raw ?? '');
  }

  effectiveDropdownFilterBy(
    dropdownConfig: Partial<{ filterBy?: string }> | undefined,
    options: IOptionDropdown[] | undefined
  ): string {
    if (this.optionsHaveRichMetadata(options)) {
      return 'label,subtitle,initial';
    }
    return dropdownConfig?.filterBy ?? 'label';
  }

  optionsHaveIconMetadata(options: IOptionDropdown[] | undefined): boolean {
    return (options ?? []).some(o => !!o.icon);
  }

  effectiveDropdownVirtualScrollItemSize(
    dropdownConfig: Partial<{ virtualScrollItemSize?: number }> | undefined,
    options: IOptionDropdown[] | undefined
  ): number {
    const base =
      dropdownConfig?.virtualScrollItemSize ??
      this.ALL_DROPDOWN_CONFIG.VIRTUAL_SCROLL_ITEM_SIZE;
    if (this.optionsHaveRichMetadata(options)) {
      return Math.max(base, 56);
    }
    if (this.optionsHaveIconMetadata(options)) {
      return Math.max(base, 44);
    }
    return base;
  }

  hasDropdownOptionIcon(option: IOptionDropdown | null | undefined): boolean {
    return !!option?.icon;
  }

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
    this.dependentDropdownParentValue(); // ensure recomputation when parent control changes
    const opts = this.getDropdownOptions();
    const displayOptions =
      opts.length > 0 ? opts : [this.getEmptyDropdownPlaceholderOption()];
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

  /** Tracks parent field value for dependent SELECT/MULTI_SELECT so empty-state label updates (not a signal on the form control). */
  private dependentDropdownParentValue = signal<unknown>(undefined);

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

    this.dependentDropdownParentValue.set(parentControl.value);

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
    let previousParentValue: unknown = initialParentValue ?? null;

    parentControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parentValue: unknown) => {
        this.dependentDropdownParentValue.set(parentValue);

        // Get new options based on parent value
        const newOptions = parentValue
          ? (serviceMethod as (value: string) => IOptionDropdown[]).call(
              this.appConfigurationService,
              parentValue as string
            )
          : [];

        this.dependentDropdownOptions.set(newOptions);

        // Reset current field only when parent value actually changed (not on disable/enable etc.)
        const parentValueChanged = previousParentValue !== parentValue;
        previousParentValue = parentValue;

        if (resetOnParentChange && parentValueChanged && currentControl) {
          if (config.fieldType === EDataType.MULTI_SELECT) {
            currentControl.setValue([]);
          } else {
            currentControl.setValue(null);
          }
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
        employeeStatusFilter?: string[];
        archivedHandling?: 'disabled' | 'enabled' | 'hidden';
        includeLoggedInUser?: boolean;
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

    if (dropdownConfig.dynamicDropdown?.includeLoggedInUser === false) {
      const selfId = this.authService.getCurrentUser()?.userId?.trim();
      if (selfId) {
        options = filterOptionsByIncludeExclude(options, [], [selfId]);
      }
    }

    options = this.applyEmployeeDropdownOptionRules(
      options,
      dropdownConfig.dynamicDropdown
    );

    return options;
  }

  private applyEmployeeDropdownOptionRules(
    options: IOptionDropdown[],
    dynamicDropdown?: {
      moduleName: string;
      dropdownName: string;
      employeeStatusFilter?: string[];
      archivedHandling?: 'disabled' | 'enabled' | 'hidden';
    }
  ): IOptionDropdown[] {
    if (!dynamicDropdown || !this.isEmployeeListDropdown(dynamicDropdown)) {
      return options;
    }

    let nextOptions = options;
    const statusFilter = (dynamicDropdown.employeeStatusFilter ?? [])
      .map(status => status.trim().toLowerCase())
      .filter(Boolean);

    if (statusFilter.length > 0) {
      const allowedStatuses = new Set(statusFilter);
      nextOptions = nextOptions.filter(option =>
        allowedStatuses.has(this.getEmployeeStatusFromDropdownOption(option))
      );
    }

    const archivedHandling = dynamicDropdown.archivedHandling ?? 'disabled';

    if (archivedHandling === 'hidden') {
      return nextOptions.filter(
        option =>
          this.getEmployeeStatusFromDropdownOption(option) !== 'archived'
      );
    }

    if (archivedHandling === 'enabled') {
      return nextOptions.map(option =>
        this.getEmployeeStatusFromDropdownOption(option) === 'archived'
          ? { ...option, disabled: false }
          : option
      );
    }

    return nextOptions.map(option =>
      this.getEmployeeStatusFromDropdownOption(option) === 'archived'
        ? { ...option, disabled: true }
        : option
    );
  }

  private isEmployeeListDropdown(dynamicDropdown: {
    moduleName: string;
    dropdownName: string;
  }): boolean {
    return (
      dynamicDropdown.moduleName === MODULE_NAMES.EMPLOYEE &&
      dynamicDropdown.dropdownName === CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST
    );
  }

  private getEmployeeStatusFromDropdownOption(option: IOptionDropdown): string {
    const optionData = option.data as { status?: string } | undefined;
    return optionData?.status?.trim().toLowerCase() ?? '';
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

  private isDependentParentValueEmpty(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return true;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return false;
  }

  private dependsOnFieldDisplayLabel(
    dependsOnField: string,
    explicitLabel?: string
  ): string {
    const trimmed = explicitLabel?.trim();
    if (trimmed) {
      return trimmed;
    }
    return toTitleCase(dependsOnField.replace(/_/g, ' '));
  }

  /** When options are empty: dependent + parent not selected → hint; otherwise "No data found". */
  private getEmptyDropdownPlaceholderOption(): IOptionDropdown {
    const config = this.inputFieldConfig();
    const dropdownConfig =
      config.fieldType === EDataType.SELECT
        ? config.selectConfig
        : config.fieldType === EDataType.MULTI_SELECT
          ? config.multiSelectConfig
          : undefined;
    const dd = dropdownConfig?.dependentDropdown;
    if (!dd || !this.formGroup()) {
      return {
        label: 'No data found',
        value: DROPDOWN_DISABLED_ROW_VALUE,
        disabled: true,
      };
    }
    const parentVal = this.dependentDropdownParentValue();
    if (this.isDependentParentValueEmpty(parentVal)) {
      const parentName = this.dependsOnFieldDisplayLabel(
        dd.dependsOnField,
        dd.dependsOnFieldLabel
      );
      return {
        label: `Please select ${parentName} first`,
        value: DROPDOWN_DISABLED_ROW_VALUE,
        disabled: true,
      };
    }
    return {
      label: 'No data found',
      value: DROPDOWN_DISABLED_ROW_VALUE,
      disabled: true,
    };
  }

  getAutocompleteOptions(): IOptionDropdown[] {
    const { autocompleteConfig } = this.inputFieldConfig();
    if (!autocompleteConfig) {
      return [];
    }
    return this.getOptionsFromDropdownLikeConfig(autocompleteConfig);
  }

  getEditorToolbarOptions(
    editorConfig: Partial<IEditorFieldConfig> | undefined
  ): string[] {
    const filter = editorConfig?.toolbarFilter;
    const include = filter?.include ?? [];
    const exclude = filter?.exclude ?? [];

    if (include.length > 0) {
      return include;
    }
    if (exclude.length > 0) {
      const excludeSet = new Set<string>(exclude);
      return Object.values(EEditorToolbarOption).filter(
        opt => !excludeSet.has(opt)
      );
    }
    return [];
  }

  /**
   * Map our option string to Quill toolbar item. Dropdowns use {} with empty array so Quill uses theme defaults.
   */
  private static toQuillToolbarItem(opt: string): string | object | object[] {
    switch (opt) {
      case 'script_sub':
        return { script: 'sub' };
      case 'script_super':
        return { script: 'super' };
      case 'align':
        return { align: [] };
      case 'background':
        return { background: [] };
      case 'color':
        return { color: [] };
      case 'font':
        return { font: [] };
      case 'size':
        return { size: ['small', false, 'large', 'huge'] };
      case 'header':
        return { header: [1, 2, 3, 4, 5, 6, false] };
      case 'list':
        return [{ list: 'ordered' }, { list: 'bullet' }];
      case 'direction':
        return { direction: 'rtl' };
      default:
        return opt;
    }
  }

  getEditorModules(
    editorConfig: Partial<IEditorFieldConfig> | undefined
  ): { toolbar: (string | object)[][] } | undefined {
    const options = this.getEditorToolbarOptions(editorConfig);
    if (options.length === 0) {
      return undefined;
    }
    const items = options.flatMap(opt => {
      const item = InputFieldComponent.toQuillToolbarItem(opt);
      return Array.isArray(item) ? item : [item];
    });
    return { toolbar: [items] };
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

  /**
   * Blocks disallowed keystrokes for TEXT / TEXT_AREA when `textConfig.regex` is set.
   */
  onTextKeyDown(event: KeyboardEvent): void {
    const strip = this.getTextRegex();
    if (!strip) {
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    if (event.isComposing) {
      return;
    }
    const { key } = event;
    if (key.length !== 1) {
      return;
    }
    const invalid = invalidCharsPatternFromStrip(strip);
    if (invalid.test(key)) {
      event.preventDefault();
    }
  }

  /**
   * Catches insertion paths that keydown can miss (e.g. some mobile keyboards).
   * Paste / drop still goes through; `(input)` + `normalizeTextFieldValue` sanitizes the full string.
   */
  onTextBeforeInput(event: Event): void {
    const strip = this.getTextRegex();
    if (!strip) {
      return;
    }
    const e = event as InputEvent;
    if (e.isComposing) {
      return;
    }
    if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') {
      return;
    }
    if (e.data === null || e.data === '') {
      return;
    }
    const invalid = invalidCharsPatternFromStrip(strip);
    if (invalid.test(e.data)) {
      e.preventDefault();
    }
  }

  private getTextRegex(): RegExp | null {
    const config = this.inputFieldConfig();
    if (
      config.fieldType !== EDataType.TEXT &&
      config.fieldType !== EDataType.TEXT_AREA
    ) {
      return null;
    }
    return config.textConfig?.regex ?? null;
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
   * Range + `rangeAutoCompleteEndWithStart`: if the panel closes with only a start date,
   * set end = start (single-day range). Must run on close — doing this on every value
   * change breaks selecting a true start/end range in the calendar.
   */
  onDateRangePanelClose(): void {
    const config = this.inputFieldConfig();
    if (
      config.fieldType !== EDataType.DATE ||
      config.dateConfig?.selectionMode !== EDateSelectionMode.Range ||
      !config.dateConfig?.rangeAutoCompleteEndWithStart
    ) {
      return;
    }
    setTimeout(() => {
      if (this.isFormMode()) {
        const control = this.formGroup()?.get(config.fieldName);
        if (!control) {
          return;
        }
        const v = control.value;
        if (!this.isIncompleteDateRangeValue(v)) {
          return;
        }
        const start = v[0];
        const next: [Date, Date] = [start, new Date(start.getTime())];
        control.setValue(next);
        control.markAsDirty();
        control.updateValueAndValidity();
        this.formControlValue.set(next);
        this.validationTrigger.update(x => x + 1);
        this.onFieldChange.emit(true);
      } else {
        const v = this.effectiveValue();
        if (!this.isIncompleteDateRangeValue(v)) {
          return;
        }
        const start = v[0];
        const next: [Date, Date] = [start, new Date(start.getTime())];
        this.onFieldChange.emit(next);
      }
    }, 0);
  }

  private isIncompleteDateRangeValue(
    v: unknown
  ): v is [Date, null | undefined] {
    if (
      !Array.isArray(v) ||
      !(v[0] instanceof Date) ||
      (v[1] !== null && v[1] !== undefined)
    ) {
      return false;
    }
    return !Number.isNaN(v[0].getTime());
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
        valueToSet = this.normalizeTextFieldValue(valueToSet, config);
      }
      control.setValue(valueToSet);
      control.markAsDirty();
      control.updateValueAndValidity();
      this.formControlValue.set(valueToSet);
      this.validationTrigger.update(v => v + 1);
      this.onFieldChange.emit(true);
    } else {
      const config = this.inputFieldConfig();
      let out = value;
      if (
        (config.fieldType === EDataType.TEXT ||
          config.fieldType === EDataType.TEXT_AREA) &&
        typeof out === 'string'
      ) {
        out = this.normalizeTextFieldValue(out, config);
      }
      this.onFieldChange.emit(out);
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
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['maxlength']) {
      return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    }
    if (errors['exactDigitLength']) {
      const e = errors['exactDigitLength'];
      return typeof e === 'string' ? e : 'Invalid number length';
    }
    if (errors['minDigitLength']) {
      const e = errors['minDigitLength'];
      return typeof e === 'string' ? e : 'Minimum digit length not met';
    }
    if (errors['maxDigitLength']) {
      const e = errors['maxDigitLength'];
      return typeof e === 'string' ? e : 'Maximum digit length exceeded';
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
    if (errors['minFileLimit']) {
      return `Please upload at least ${errors['minFileLimitValue']} file(s).`;
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
      return 'Please enter a valid email address';
    }

    return 'Invalid value';
  }

  private normalizeTextFieldValue(
    value: string,
    config: IInputFieldsConfig
  ): string {
    let v = this.applyTextInputAccept(value, config.textConfig);
    if (config.textConfig?.textCase) {
      v = this.applyTextCase(v, config.textConfig.textCase);
    }
    return v;
  }

  private applyTextInputAccept(
    value: string,
    textConfig?: Partial<ITextFieldConfig>
  ): string {
    const strip = textConfig?.regex;
    if (!strip) {
      return value;
    }
    return value.replace(strip, '');
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
