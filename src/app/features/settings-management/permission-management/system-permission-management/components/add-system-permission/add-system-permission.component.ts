import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../../shared/components/page-header/page-header.component';
import { InputFieldComponent } from '../../../../../../shared/components/input-field/input-field.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { FormService } from '../../../../../../shared/services/form.service';
import { ROUTE_BASE_PATHS, FORM_VALIDATION_MESSAGES } from '../../../../../../shared/constants';
import { IEnhancedForm } from '../../../../../../shared/models/form.model';
import { ADD_SYSTEM_PERMISSION_INPUT_FIELDS_CONFIG } from '../../config/form/add-system-permission-form.config';
import { MODULE_ACTIONS_DATA } from '../../../../../../shared/config/static-data.config';

@Component({
  selector: 'app-add-system-permission',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  templateUrl: './add-system-permission.component.html',
  styleUrl: './add-system-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSystemPermissionComponent implements OnInit {

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(ADD_SYSTEM_PERMISSION_INPUT_FIELDS_CONFIG);
  }

  protected onModuleNameChange(): void {
    const moduleName = this.form.getFieldData('moduleName');
    const actions = MODULE_ACTIONS_DATA[moduleName];
    this.form.fieldConfigs['action'].selectConfig!.optionsDropdown = actions;
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeCreatePermission(formData);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(FORM_VALIDATION_MESSAGES.FORM_INVALID);
      this.logger.warn('Add permission form validation failed');
      return false;
    }
    return true;
  }

  private executeCreatePermission(formData: any): void {
    this.isSubmitting.set(true);
    this.form.disable();

    // Simulate API call
    setTimeout(() => {
      this.notificationService.success('Permission created successfully!');
      this.isSubmitting.set(false);
      this.form.enable();
      this.router.navigate([`/${ROUTE_BASE_PATHS.SETTINGS.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM}`]);
    }, 1500);
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Permission Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private prepareFormData(): any {
    const formData = this.form.getData();
    return {
      moduleName: formData['moduleName'],
      action: formData['action'],
      description: formData['description'],
    };
  }
}
