import { Component, output, ViewChild, OnInit, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { EInputType } from '../../types/data-table-input.types';
import { InputFieldComponent } from '../input-field/input-field.component';
import { IInputFieldsConfig, IFormConfig } from '../../models/input-fields-config.model';
import { InputFieldConfigService } from '../../services/input-field-config.service';
import { ConfirmationDialogService } from '../../services/confirmation-dialog-config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IConfirmationDialogOutput } from '../../models/confirmation-dialog.model';
import { LoggerService } from '../../../core/services/logger.service';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    ConfirmDialogModule, 
    ButtonModule, 
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    InputFieldComponent,
    KeyValuePipe
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent implements OnInit {

  @ViewChild('cd') confirmDialog: any;

  private readonly inputFieldConfigService = inject(InputFieldConfigService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly fieldConfigs = signal<Record<string, IInputFieldsConfig>>({});
  protected readonly formSubmitted = signal(false);

  inputFieldsType = EInputType;  
  protected formGroup!: FormGroup;

  // Modern output signal
  onConfirm = output<IConfirmationDialogOutput>();

  ngOnInit(): void {
    this.initializeForm();
    this.setupDialogListener();
  }

  private initializeForm(): void {
    this.formGroup = this.fb.group({});
  }

  private setupDialogListener(): void {
    this.confirmationDialogService.inputFieldConfigs$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (configs) => {
          if (configs.length > 0) {
            this.updateFormForInputFields(configs);
          }
        },
        error: (error) => this.logger.error('Error in dialog listener', error)
      }
    );
  }

  private initializeFieldConfigs(formConfig: IFormConfig): void {
    try {
      const configs = this.inputFieldConfigService.initializeFieldConfigs(formConfig);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeFormGroup(formConfig: IFormConfig): void {
    try {
      this.formGroup = this.inputFieldConfigService.createFormGroup(formConfig, this.fb);
    } catch (error) {
      this.logger.error('Error creating form group', error);
    }
  }

  updateFormForInputFields(inputFieldConfigs: Partial<IInputFieldsConfig>[]): void {
    if (!inputFieldConfigs?.length) {
      this.fieldConfigs.set({});
      return;
    }

    // Convert array of partial configs to IFormConfig format
    const formConfig: IFormConfig = {};
    inputFieldConfigs.forEach((config, index) => {
      const fieldName = config.fieldName || `field_${index}`;
      formConfig[fieldName] = config;
    });

    this.initializeFieldConfigs(formConfig);
    this.initializeFormGroup(formConfig);
  }

  handleDialog(confirmed: boolean): void {
    try {
      // Only set form submitted and validate for accept action
      if (confirmed) {
        this.formSubmitted.set(true);
        
        // Check if form is valid when using input field components
        if (Object.keys(this.fieldConfigs()).length > 0 && this.formGroup.invalid) {
          // Mark all fields as touched to show validation errors
          this.formGroup.markAllAsTouched();
          this.logger.warn('Form submission failed - form invalid');
          return;
        }
      }

      const formData = confirmed ? this.formGroup.value : null;
            
      this.onConfirm.emit({ 
        confirmed, 
        formData
      });
      
      this.confirmDialog.close();
      this.resetForm();
      
    } catch (error) {
      this.logger.error(`Error handling dialog ${confirmed ? 'accept' : 'reject'}`, error);
    }
  }

  resetForm(): void {
    this.formGroup?.reset();
    this.formSubmitted.set(false);
    this.logger.debug('Confirmation dialog form reset');
  }
} 