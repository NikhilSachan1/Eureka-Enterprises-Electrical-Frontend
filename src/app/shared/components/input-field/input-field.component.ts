import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { ECalendarView, EDateIconDisplay, EDateSelectionMode, EFieldType, EHourFormat, EMultiSelectDisplayType, EUpAndDownButtonLayout, IInputFieldsConfig } from '../../models/input-fields-config.model';

@Component({
  selector: 'app-input-field',
  imports: [ReactiveFormsModule, FloatLabelModule, InputTextModule, NgClass, InputNumberModule, SelectModule, MultiSelectModule, DatePickerModule],
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss'
})
export class InputFieldComponent {

  ALL_FIELD_TYPES = EFieldType;
  ALL_UP_AND_DOWN_BUTTON_LAYOUTS = EUpAndDownButtonLayout;
  ALL_MULTI_SELECT_DISPLAY_TYPES = EMultiSelectDisplayType;
  ALL_DATE_ICON_DISPLAY_TYPES = EDateIconDisplay;
  ALL_DATE_SELECTION_MODES = EDateSelectionMode;
  ALL_HOUR_FORMATS = EHourFormat;
  ALL_CALENDAR_VIEWS = ECalendarView;

  @Input() formGroup!: FormGroup;
  @Input() inputFieldConfig!: IInputFieldsConfig;

  checkIsFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
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
}
