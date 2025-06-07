import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  ValidatorFn
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputFieldComponent } from "../../../shared/components/input-field/input-field.component";
import { ADD_EMPLOYEE_INPUT_FIELDS_CONFIG } from './employee-add.config';
import { IInputFieldsConfig } from '../../../shared/models/input-fields-config.model';
import { InputFieldConfigService } from '../../../shared/services/input-field-config.service';

@Component({
  selector: 'app-employee-add',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputFieldComponent
],
  templateUrl: './employee-add.component.html',
  styleUrl: './employee-add.component.scss',
})
export class EmployeeAddComponent implements OnInit {

  private readonly inputFieldConfigService = inject(InputFieldConfigService);
  private readonly fb = inject(FormBuilder);

  protected isSubmitting = signal(false);
  protected formSubmitted = signal(false);
  protected fieldConfigs = signal<Record<string, IInputFieldsConfig>>({});
  
  protected formGroup!: FormGroup;

  ngOnInit(): void {
    this.initializeFieldConfigs();
    this.initializeForm();
  }

  private initializeFieldConfigs(): void {
    const configs = this.inputFieldConfigService.initializeFieldConfigs(ADD_EMPLOYEE_INPUT_FIELDS_CONFIG);
    console.log('configs', configs);
    this.fieldConfigs.set(configs);
  }

  private getFormValidators(): Record<string, ValidatorFn[]> {
    const configs = this.fieldConfigs();
    return Object.keys(configs).reduce((acc, key) => {
      acc[key] = configs[key].validators || [];
      return acc;
    }, {} as Record<string, ValidatorFn[]>);
  }

  private initializeForm(): void {
    const validators = this.getFormValidators();
    this.formGroup = this.fb.group({
      fname: ['', validators['fname']],
      aadharNumber: ['', validators['aadharNumber']],
      role: ['', validators['role']],
      workOn: ['', validators['workOn']],
      dob: ['', validators['dob']],
      password: ['', validators['password']],
      checkboxInput: ['', validators['checkboxInput']],
      radioInput: ['', validators['radioInput']],
      fileInput: ['', validators['fileInput']],
    });
  }

  onSubmit(): void {
    this.formSubmitted.set(true);
    
    if (this.formGroup.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      try {
        const formData: any = this.formGroup.value;
        console.log('Form values:', formData);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        this.isSubmitting.set(false);
      }
    }
    else {
      this.formGroup.markAllAsTouched();
    }
  }

  resetForm(): void {
    this.formGroup.reset();
    this.formSubmitted.set(false);
  }
}
