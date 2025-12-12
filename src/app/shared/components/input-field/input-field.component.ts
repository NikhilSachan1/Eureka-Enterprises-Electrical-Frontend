import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  EFieldType,
  EFileMode,
  EHourFormat,
  EMultiSelectDisplayType,
  EUpAndDownButtonLayout,
  IInputFieldsConfig,
  IGalleryInputData,
  IButtonConfig,
} from '@shared/types';
import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';
import { GalleryComponent } from '../gallery/gallery.component';
import { COMMON_ROW_ACTIONS } from '@shared/config';
import {
  arrayToString,
  fileFormatValidator,
  fileLimitValidator,
  fileSizeValidator,
  stringToArray,
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
    GalleryComponent,
    ImageModule,
  ],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFieldComponent implements OnInit {
  ALL_FIELD_TYPES = EFieldType;
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

  totalUploadedSize = 0;

  filePreviewMedia = signal<Partial<IGalleryInputData>[]>([]);

  @ViewChild('fileUploadRef') fileUploadRef?: FileUpload;

  // Modern input signals - required inputs
  formGroup = input.required<FormGroup>();
  inputFieldConfig = input.required<IInputFieldsConfig>();
  onFieldChange = output<boolean>();

  ngOnInit(): void {
    if (this.inputFieldConfig().disabledInput) {
      this.formGroup().controls[this.inputFieldConfig().fieldName].disable();
    }

    if (this.inputFieldConfig().fieldType === EFieldType.File) {
      const control = this.formGroup().get(this.inputFieldConfig().fieldName);
      control?.valueChanges.subscribe(value => {
        const hasFiles = Array.isArray(value) ? value.length > 0 : !!value;

        if (!hasFiles) {
          this.fileUploadRef?.clear();
          this.totalUploadedSize = 0;
        }
      });
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
    this.filePreviewMedia.set([]);
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

  openFilePreview(files: File | File[]): void {
    if (!files) {
      return;
    }

    const filesArray: File[] = Array.isArray(files) ? files : [files];

    if (!filesArray.length) {
      return;
    }

    const mediaItems = filesArray.map(file => {
      return {
        mediaKey: file.name,
        actualMediaUrl: URL.createObjectURL(file),
        thumbnailMediaUrl: URL.createObjectURL(file),
      };
    });

    this.filePreviewMedia.set(mediaItems);
  }

  onFilePreviewClosed(): void {
    this.filePreviewMedia.set([]);
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
    if (errors['pattern']) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
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

    return 'Invalid value';
  }
}
