import { Component, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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

@Component({
  selector: 'app-employee-add',
  imports: [
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
export class EmployeeAddComponent {
  @ViewChild('ms') ms!: MultiSelect;
  formGroup!: FormGroup;
  value1: number = 1234;
  minDate: Date = new Date(2025, 4, 1);
  maxDate: Date = new Date();
  uploadedFiles: any[] = [];
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

  selectAll: boolean = false;
  selectedItems!: any[];

  onSelectAllChange(event: any) {
    this.selectedItems = event.checked ? [...this.ms.visibleOptions()] : [];
    this.selectAll = event.checked;
  }

  onUpload(event: any) {
    const file = event.files[0];
    if (file) {
      // Create object URL for preview
      file.objectURL = URL.createObjectURL(file);
      this.uploadedFiles = [file];
      
      // Update form control value
      this.formGroup.patchValue({
        fileInput: file
      });
    }
  }

  removeFile(file: any) {
    // Revoke object URL to prevent memory leaks
    if (file.objectURL) {
      URL.revokeObjectURL(file.objectURL);
    }
    this.uploadedFiles = [];
    this.formGroup.patchValue({
      fileInput: null
    });
  }

  ngOnInit() {
    this.formGroup = new FormGroup({
      textInput: new FormControl({ value: '', disabled: false }),
      numberInput: new FormControl({ value: 1234, disabled: false }),
      selectInput: new FormControl({ value: null, disabled: false }),
      multiSelectInput: new FormControl({ value: [], disabled: false }),
      dateInput: new FormControl({ value: '', disabled: false }),
      passwordInput: new FormControl({ value: '', disabled: false }),
      checkboxInput: new FormControl({ value: [], disabled: false }),
      radioInput: new FormControl({ value: '', disabled: false }),
      fileInput: new FormControl({ value: null, disabled: false })
    });
  }

  ngOnDestroy() {
    // Clean up object URLs when component is destroyed
    this.uploadedFiles.forEach(file => {
      if (file.objectURL) {
        URL.revokeObjectURL(file.objectURL);
      }
    });
  }

  onSubmit() {
    if (this.formGroup.valid) {
      console.log('Form submitted successfully!');
      console.log('Form values:', this.formGroup.value);
    } else {
      console.log('Form is invalid!');
      // Mark all fields as touched to show validation errors
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup.get(key);
        control?.markAsTouched();
      });
    }
  }
}
