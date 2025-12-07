import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
  output,
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
  FileUploadModule,
} from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { InputOtpModule } from 'primeng/inputotp';
import {
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
} from '@shared/types';
import { APP_CONFIG } from '@core/config';

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
  // Modern input signals - required inputs
  formGroup = input.required<FormGroup>();
  inputFieldConfig = input.required<IInputFieldsConfig>();
  onFieldChange = output<boolean>();

  ngOnInit(): void {
    if (this.inputFieldConfig().disabledInput) {
      this.formGroup().controls[this.inputFieldConfig().fieldName].disable();
    }
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

  onFileSelect(fieldName: string, event: FileSelectEvent): void {
    const control = this.formGroup().get(fieldName);

    if (!control) {
      return;
    }

    const rawFiles = event?.files ?? [];
    const files: File[] = Array.from(rawFiles as File[] | FileList);
    control.setValue(files);
    control.markAsDirty();
    control.updateValueAndValidity();
    this.onFieldChange.emit(true);
  }

  onFileRemove(fieldName: string, event: FileRemoveEvent): void {
    const control = this.formGroup().get(fieldName);

    if (!control) {
      return;
    }

    const isMultiple =
      this.inputFieldConfig().fileConfig?.multipleFiles ?? false;

    if (!isMultiple) {
      control.setValue([]);
    } else {
      const rawCurrent = (control.value ?? []) as File[] | FileList;
      const currentFiles: File[] = Array.isArray(rawCurrent)
        ? rawCurrent
        : Array.from(rawCurrent);
      const removedFile: File | undefined = event?.file;

      if (removedFile) {
        const updatedFiles = currentFiles.filter(file => file !== removedFile);
        control.setValue(updatedFiles);
      } else {
        control.setValue([]);
      }
    }

    control.markAsDirty();
    control.updateValueAndValidity();
    this.onFieldChange.emit(true);
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

    return 'Invalid value';
  }
}
