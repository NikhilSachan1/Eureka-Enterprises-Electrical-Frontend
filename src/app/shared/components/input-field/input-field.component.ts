import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
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
} from '@shared/types';
import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import { GalleryService } from '@shared/services';
import {
  arrayToString,
  fileFormatValidator,
  fileLimitValidator,
  fileSizeValidator,
  stringToArray,
  toLowerCase,
  toSentenceCase,
  toTitleCase,
  toUpperCase,
} from '@shared/utility';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-input-field',
  imports: [
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    NgClass,
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
    ButtonComponent,
    ImageModule,
  ],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFieldComponent implements OnInit, AfterViewInit {
  private readonly galleryService = inject(GalleryService);

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

  formGroup = input.required<FormGroup>();
  inputFieldConfig = input.required<IInputFieldsConfig>();
  onFieldChange = output<boolean>();

  // Cached validator values to avoid recalculation on every input
  private cachedMaxLength: number | null = null;
  private cachedPattern: RegExp | null = null;
  private validatorsInitialized = false;

  ngOnInit(): void {
    const config = this.inputFieldConfig();

    if (config.disabledInput) {
      this.formGroup().controls[config.fieldName].disable();
    }

    // Initialize cached validator values once
    if (!this.validatorsInitialized) {
      this.cachedMaxLength = this.extractMaxLength();
      this.cachedPattern = this.extractPattern();
      this.validatorsInitialized = true;
    }

    if (config.fieldType === EDataType.ATTACHMENTS) {
      const control = this.formGroup().get(config.fieldName);
      control?.valueChanges.subscribe(value => {
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

  ngAfterViewInit(): void {
    if (this.inputFieldConfig().fieldType === EDataType.ATTACHMENTS) {
      const control = this.formGroup().get(this.inputFieldConfig().fieldName);
      const files = control?.value;

      if (this.shouldUpdateFileUpload(files)) {
        this.updateFileUpload(files);
      }
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
    const control = this.formGroup().get(this.inputFieldConfig().fieldName);
    if (!control) {
      return;
    }

    control.setValue([]);
    this.totalUploadedSize = 0;
  }

  onFilesSelected(event: FileSelectEvent): void {
    const control = this.formGroup().get(this.inputFieldConfig().fieldName);
    if (!control) {
      return;
    }

    const existingValidator = control.validator;
    const fileValidators = [
      fileLimitValidator(this.inputFieldConfig().fileConfig?.fileLimit ?? 0),
      fileSizeValidator(this.inputFieldConfig().fileConfig?.maxFileSize ?? 0),
      fileFormatValidator(
        this.inputFieldConfig().fileConfig?.acceptFileTypes ?? []
      ),
    ];

    control.setValidators(
      existingValidator
        ? [existingValidator, ...fileValidators]
        : fileValidators
    );

    this.totalUploadedSize = event.currentFiles.reduce(
      (acc, file) => acc + file.size,
      0
    );
    control.setValue(event.currentFiles);
    control.markAsDirty();
    control.updateValueAndValidity();
  }

  onFileRemoved(event: FileRemoveEvent): void {
    const control = this.formGroup().get(this.inputFieldConfig().fieldName);

    this.totalUploadedSize -= event.file.size;
    if (!control) {
      return;
    }

    const currentFiles = control.value as File[];
    const updatedFiles = currentFiles.filter(file => file !== event.file);

    control.setValue(updatedFiles);
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
    const control = this.formGroup().get(fieldName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  onChange(): void {
    this.onFieldChange.emit(true);
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
    const control = this.formGroup().get(fieldName);
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
   * Global input handler for all text-based fields (TEXT, TEXT_AREA, PASSWORD)
   * Handles maxlength prevention, pattern filtering, and text case formatting
   */
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | HTMLTextAreaElement;
    const control = this.formGroup().get(this.inputFieldConfig().fieldName);
    if (!control) {
      return;
    }

    const config = this.inputFieldConfig();
    let { value } = inputElement;

    // Apply maxlength prevention
    if (
      config.preventMaxLength !== false &&
      this.cachedMaxLength !== null &&
      value.length > this.cachedMaxLength
    ) {
      value = value.substring(0, this.cachedMaxLength);
    }

    // Apply pattern filtering
    if (config.applyPatternFilter !== false && this.cachedPattern) {
      const pattern = this.cachedPattern;
      value = value
        .split('')
        .filter(char => pattern.test(char))
        .join('');
    }

    // Apply text case formatting (only for TEXT field type)
    if (config.textConfig?.textCase) {
      value = this.applyTextCase(value, config.textConfig.textCase);
    }

    // Update if changed
    if (value !== inputElement.value) {
      inputElement.value = value;
      control.setValue(value, { emitEvent: false });
      control.markAsDirty();
    }
  }

  /**
   * Extracts maxlength from validators (cached on init)
   */
  private extractMaxLength(): number | null {
    const { validators } = this.inputFieldConfig();
    if (!validators?.length) {
      return null;
    }

    const testControl = { value: 'x'.repeat(1000) } as AbstractControl;
    for (const validator of validators) {
      // Check if validator is wrapped with withCustomMessage
      const wrappedValidator = validator as ValidatorFn & {
        __originalValidator?: ValidatorFn;
      };
      const originalValidator =
        wrappedValidator.__originalValidator ?? validator;

      const result = originalValidator(testControl);
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
