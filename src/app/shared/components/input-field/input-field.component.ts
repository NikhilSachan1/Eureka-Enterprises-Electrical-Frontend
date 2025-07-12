import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
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
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { InputOtpModule } from 'primeng/inputotp';
import { ECalendarView, ECheckBoxAndRadioAlign, EDateIconDisplay, EDateSelectionMode, EFieldType, EFileMode, EHourFormat, EMultiSelectDisplayType, EUpAndDownButtonLayout } from '../../types';
import { IInputFieldsConfig } from '../../models';

@Component({
  selector: 'app-input-field',
  imports: [ReactiveFormsModule, FloatLabelModule, InputTextModule, NgClass, InputNumberModule, SelectModule, MultiSelectModule, DatePickerModule, PasswordModule, CheckboxModule, RadioButtonModule, FileUploadModule, TextareaModule, InputOtpModule],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFieldComponent {

  ALL_FIELD_TYPES = EFieldType;
  ALL_UP_AND_DOWN_BUTTON_LAYOUTS = EUpAndDownButtonLayout;
  ALL_MULTI_SELECT_DISPLAY_TYPES = EMultiSelectDisplayType;
  ALL_DATE_ICON_DISPLAY_TYPES = EDateIconDisplay;
  ALL_DATE_SELECTION_MODES = EDateSelectionMode;
  ALL_HOUR_FORMATS = EHourFormat;
  ALL_CALENDAR_VIEWS = ECalendarView;
  ALL_CHECKBOX_AND_RADIO_ALIGN = ECheckBoxAndRadioAlign;
  ALL_FILE_MODES = EFileMode;

  // Form-based inputs (optional now)
  formGroup = input<FormGroup | null>(null);
  inputFieldConfig = input.required<IInputFieldsConfig>();
  
  // Standalone mode inputs
  value = input<any>(null);
  disabled = input<boolean>(false);
  
  // Outputs
  onFieldChange = output<boolean>();
  valueChange = output<any>();
  
  // Internal state for standalone mode
  private _standaloneValue = signal<any>(null);

  // Computed property to determine if we're in standalone mode
  get isStandaloneMode(): boolean {
    return this.formGroup() === null;
  }

  // Get current value (form or standalone)
  getCurrentValue(): any {
    if (this.isStandaloneMode) {
      return this._standaloneValue();
    }
    const control = this.formGroup()?.get(this.inputFieldConfig().fieldName);
    return control?.value;
  }

  // Set value (form or standalone)
  setValue(value: any): void {
    if (this.isStandaloneMode) {
      this._standaloneValue.set(value);
      this.valueChange.emit(value);
    } else {
      const control = this.formGroup()?.get(this.inputFieldConfig().fieldName);
      if (control) {
        control.setValue(value);
      }
    }
  }

  checkIsFieldInvalid(fieldName: string): boolean {
    if (this.isStandaloneMode) {
      return false; // No validation in standalone mode
    }
    const control = this.formGroup()?.get(fieldName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  onChange(): void {
    this.onFieldChange.emit(true);
  }

  onStandaloneChange(value: any): void {
    this.setValue(value);
    this.onChange();
  }

  getErrorMessage(fieldName: string): string {
    if (this.isStandaloneMode) {
      return ''; // No error messages in standalone mode
    }
    const control = this.formGroup()?.get(fieldName);
    if (!control) return '';

    const errors = control.errors;
    if (!errors) return '';

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;
    if (errors['pattern']) return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    if (errors['hasSpecialChars']) return 'Text should not contain any special characters';

    return 'Invalid value';
  }

  ngOnInit(): void {
    // Initialize standalone value from input
    if (this.isStandaloneMode) {
      this._standaloneValue.set(this.value() || this.inputFieldConfig().defaultValue);
    }
  }
}
