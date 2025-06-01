import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormBuilder
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { InputFieldComponent } from "../../../shared/components/input-field/input-field.component";
import { ADD_EMPLOYEE_INPUT_FIELDS_CONFIG } from './employee-add.config';

@Component({
  selector: 'app-employee-add',
  imports: [
    CommonModule,
    FloatLabelModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    DatePickerModule,
    PasswordModule,
    CheckboxModule,
    RadioButtonModule,
    FileUploadModule,
    ButtonModule,
    InputFieldComponent
],
  templateUrl: './employee-add.component.html',
  styleUrl: './employee-add.component.scss',
})
export class EmployeeAddComponent implements OnInit, OnDestroy {

  ADD_EMPLOYEE_INPUT_FIELDS_CONFIG = ADD_EMPLOYEE_INPUT_FIELDS_CONFIG;

  @ViewChild('ms') ms!: MultiSelect;
  
  // Form group
  formGroup!: FormGroup;
  
  // Form state
  isSubmitting = false;
  formSubmitted = false;

  // Date constraints
  minDate: Date = new Date(2025, 4, 1);
  maxDate: Date = new Date();

  // File handling
  uploadedFiles: any[] = [];

  // Dropdown options
  cities = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];

  categories = [
    { name: 'Category 1', key: 'C1' },
    { name: 'Category 2', key: 'C2' },
    { name: 'Category 3', key: 'C3' },
    { name: 'Category 4', key: 'C4' }
  ];

  // Multi-select state
  selectAll = false;
  selectedItems: any[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.cleanupFileUrls();
  }

  private initializeForm(): void {

    this.formGroup = this.fb.group({
      fname: ['', ADD_EMPLOYEE_INPUT_FIELDS_CONFIG['fname'].validators],
      aadharNumber: ['', ADD_EMPLOYEE_INPUT_FIELDS_CONFIG['aadharNumber'].validators],
      role: ['', ADD_EMPLOYEE_INPUT_FIELDS_CONFIG['role'].validators],
      workOn: ['', ADD_EMPLOYEE_INPUT_FIELDS_CONFIG['workOn'].validators],
      dob: ['', ADD_EMPLOYEE_INPUT_FIELDS_CONFIG['dob'].validators],
    });
  }

  private cleanupFileUrls(): void {
    this.uploadedFiles.forEach(file => {
      if (file.objectURL) {
        URL.revokeObjectURL(file.objectURL);
      }
    });
  }

  onUpload(event: any): void {
    const file = event.files[0];
    if (file) {
      file.objectURL = URL.createObjectURL(file);
      this.uploadedFiles = [file];
      this.formGroup.patchValue({ fileInput: file });
    }
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

  // Helper method to check if form is pristine
  isFormPristine(): boolean {
    return this.formGroup.pristine;
  }

  // Helper method to reset form
  resetForm(): void {
    this.formGroup.reset();
    this.formSubmitted = false;
    this.uploadedFiles = [];
  }
}
