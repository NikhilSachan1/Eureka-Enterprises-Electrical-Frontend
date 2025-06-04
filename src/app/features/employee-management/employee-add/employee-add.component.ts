import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputFieldComponent } from "../../../shared/components/input-field/input-field.component";
import { ADD_EMPLOYEE_INPUT_FIELDS_CONFIG } from './employee-add.config';
import { IInputFieldsConfig } from '../../../shared/models/input-fields-config.model';

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

  ADD_EMPLOYEE_INPUT_FIELDS_CONFIG = ADD_EMPLOYEE_INPUT_FIELDS_CONFIG;

  getFieldConfig(key: keyof typeof ADD_EMPLOYEE_INPUT_FIELDS_CONFIG): IInputFieldsConfig {
    return this.ADD_EMPLOYEE_INPUT_FIELDS_CONFIG[key] as IInputFieldsConfig;
  }
  
  // Form group
  formGroup!: FormGroup;
  
  // Form state
  isSubmitting = false;
  formSubmitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {

    this.formGroup = this.fb.group({
      fname: ['', this.getFieldConfig('fname').validators],
      aadharNumber: ['', this.getFieldConfig('aadharNumber').validators],
      role: ['', this.getFieldConfig('role').validators],
      workOn: ['', this.getFieldConfig('workOn').validators],
      dob: ['', this.getFieldConfig('dob').validators],
      password: ['', this.getFieldConfig('password').validators],
      checkboxInput: ['', this.getFieldConfig('checkboxInput').validators],
      radioInput: ['', this.getFieldConfig('radioInput').validators],
      fileInput: ['', this.getFieldConfig('fileInput').validators],
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    if (this.formGroup.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      try {
        const formData: any = this.formGroup.value;
        console.log('Form submitted successfully!');
        console.log('Form values:', formData);
        
        // Here you would typically make an API call
        // await this.employeeService.createEmployee(formData);
        
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched(this.formGroup);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


  // Helper method to reset form
  resetForm(): void {
    this.formGroup.reset();
    this.formSubmitted = false;
  }
}
