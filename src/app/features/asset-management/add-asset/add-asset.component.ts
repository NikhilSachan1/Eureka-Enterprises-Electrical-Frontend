import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field.component';
import { IInputFieldsConfig } from '../../../shared/models/input-fields-config.model';
import { InputFieldConfigService } from '../../../shared/services/input-field-config.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Router } from '@angular/router';
import { ADD_ASSET_INPUT_FIELDS_CONFIG } from '../config/form/add-asset-form.config';

@Component({
  selector: 'app-add-asset',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ReactiveFormsModule,
    ButtonModule,
    InputFieldComponent
  ],
  templateUrl: './add-asset.component.html',
  styleUrl: './add-asset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddAssetComponent implements OnInit {

  // Dependency Injection
  private readonly inputFieldConfigService = inject(InputFieldConfigService);
  private readonly fb = inject(FormBuilder);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);

  // Signals
  protected fieldConfigs = signal<Record<string, IInputFieldsConfig>>({});
  protected loading = signal<boolean>(false);
  protected formSubmitted = signal<boolean>(false);

  // Form Group
  protected formGroup!: FormGroup;

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.initializeFieldConfigs();
    this.initializeForm();
  }

  private initializeFieldConfigs(): void {
    try {
      const configs = this.inputFieldConfigService.initializeFieldConfigs(ADD_ASSET_INPUT_FIELDS_CONFIG);
      this.fieldConfigs.set(configs);
    } catch (error) {
      this.logger.error('Error initializing field configs', error);
    }
  }

  private initializeForm(): void {
    try {
      this.formGroup = this.inputFieldConfigService.createFormGroup(ADD_ASSET_INPUT_FIELDS_CONFIG, this.fb);
    } catch (error) {
      this.logger.error('Error initializing form', error);
    }
  }

  resetForm(): void {
    try {
      this.formGroup.reset();
      this.formSubmitted.set(false);
      this.logger.info('Add asset form reset successfully');
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  onSubmit(): void {
    try {
      this.formSubmitted.set(true);
      
      if (this.formGroup.valid && !this.loading()) {
        this.loading.set(true);
        
        const formData = this.formGroup.value;
        this.logger.logUserAction('Submit Add Asset Form', { hasFormData: !!formData });
        
        // TODO: Replace with proper asset submission logic using assetService
        setTimeout(() => {
          this.logger.info('Add asset form submitted successfully', {
            assetName: formData.assetName,
            assetModel: formData.assetModel,
            assetSerialNumber: formData.assetSerialNumber,
            usage: formData.usage,
            calibrationFrom: formData.calibrationFrom,
            calibrationEnd: formData.calibrationEnd,
            hasAssetCertificate: !!formData.assetCertificate,
            hasAssetImages: !!formData.assetImages
          });
          this.loading.set(false);
          this.router.navigate(['/asset/list']);
        }, 1000);
        
      } else {
        this.logger.warn('Form submission failed - form invalid or already submitting');
        this.formGroup.markAllAsTouched();
      }
    } catch (error) {
      this.logger.error('Error submitting form', error);
      this.loading.set(false);
    }
  }
}
