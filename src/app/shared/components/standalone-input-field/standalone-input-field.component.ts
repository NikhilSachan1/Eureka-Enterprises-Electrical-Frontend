import { ChangeDetectionStrategy, Component, input, output, signal, computed, effect } from '@angular/core';
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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-standalone-input-field',
  imports: [FloatLabelModule, InputTextModule, InputNumberModule, SelectModule, MultiSelectModule, DatePickerModule, PasswordModule, CheckboxModule, RadioButtonModule, FileUploadModule, TextareaModule, InputOtpModule, FormsModule],
  templateUrl: './standalone-input-field.component.html',
  styleUrl: './standalone-input-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandaloneInputFieldComponent {

  ALL_FIELD_TYPES = EFieldType;
  ALL_UP_AND_DOWN_BUTTON_LAYOUTS = EUpAndDownButtonLayout;
  ALL_MULTI_SELECT_DISPLAY_TYPES = EMultiSelectDisplayType;
  ALL_DATE_ICON_DISPLAY_TYPES = EDateIconDisplay;
  ALL_DATE_SELECTION_MODES = EDateSelectionMode;
  ALL_HOUR_FORMATS = EHourFormat;
  ALL_CALENDAR_VIEWS = ECalendarView;
  ALL_CHECKBOX_AND_RADIO_ALIGN = ECheckBoxAndRadioAlign;
  ALL_FILE_MODES = EFileMode;

  // Inputs
  inputFieldConfig = input.required<IInputFieldsConfig>();
  isFieldInvalid = input<boolean>(false);
  fieldValue = input<any>(undefined);
  
  protected currentValue = computed(() => {
    const externalValue = this.fieldValue();
    return externalValue !== undefined ? externalValue : this.inputFieldConfig().defaultValue;
  });
  
  // Outputs
  onFieldChange = output<any>();

  onStandaloneChange(event: any): void {
    let value: any;
    if(event.target?.value) {
      value = event.target.value;
    } else if(event.checked) {
      value = event.checked;
    } else {
      value = event;
    }    
    this.onFieldChange.emit(value);
  }
} 