import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import {
  FormControl,
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
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';

// Form model interface
interface EmployeeFormModel {
  textInput: string;
  numberInput: number;
  selectInput: any;
  multiSelectInput: any[];
  dateInput: Date;
  passwordInput: string;
  checkboxInput: any[];
  radioInput: any;
  fileInput: File | null;
}

// Custom validator function
function noSpecialCharactersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value);
    return hasSpecialChars ? { hasSpecialChars: true } : null;
  };
}

@Component({
  selector: 'app-employee-add',
  imports: [
    CommonModule,
    FloatLabelModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumber,
    Select,
    MultiSelectModule,
    DatePickerModule,
    PasswordModule,
    CheckboxModule,
    RadioButtonModule,
    FileUploadModule,
    ButtonModule
  ],
  templateUrl: './employee-add.component.html',
  styleUrl: './employee-add.component.scss',
})
export class EmployeeAddComponent implements OnInit, OnDestroy {
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
      textInput: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        noSpecialCharactersValidator()
      ]],
      numberInput: [1234, [
        Validators.required,
        Validators.min(5),
        Validators.max(10)
      ]],
      selectInput: [null, [Validators.required]],
      multiSelectInput: [[], [
        Validators.required,
        Validators.minLength(1)
      ]],
      dateInput: ['', [Validators.required]],
      passwordInput: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      checkboxInput: [[], [
        Validators.required,
        Validators.minLength(1)
      ]],
      radioInput: ['', [Validators.required]],
      fileInput: [null, [Validators.required]]
    });
  }

  private cleanupFileUrls(): void {
    this.uploadedFiles.forEach(file => {
      if (file.objectURL) {
        URL.revokeObjectURL(file.objectURL);
      }
    });
  }

  onSelectAllChange(event: any): void {
    this.selectedItems = event.checked ? [...this.ms.visibleOptions()] : [];
    this.selectAll = event.checked;
  }

  onUpload(event: any): void {
    const file = event.files[0];
    if (file) {
      file.objectURL = URL.createObjectURL(file);
      this.uploadedFiles = [file];
      this.formGroup.patchValue({ fileInput: file });
    }
  }

  removeFile(file: any): void {
    if (file.objectURL) {
      URL.revokeObjectURL(file.objectURL);
    }
    this.uploadedFiles = [];
    this.formGroup.patchValue({ fileInput: null });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    
    if (this.formGroup.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      try {
        const formData: EmployeeFormModel = this.formGroup.value;
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

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return control ? (control.invalid && (control.dirty || control.touched || this.formSubmitted)) : false;
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
