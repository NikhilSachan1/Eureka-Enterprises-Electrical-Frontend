import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../../shared/components/page-header/page-header.component';
import { InputFieldComponent } from '../../../../../../shared/components/input-field/input-field.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { FormService } from '../../../../../../shared/services/form.service';
import { ROUTE_BASE_PATHS, FORM_VALIDATION_MESSAGES } from '../../../../../../shared/constants';
import { IEnhancedForm } from '../../../../../../shared/models';
import { ADD_ROLE_PERMISSION_INPUT_FIELDS_CONFIG } from '../../config/form/add-role-permission-form.config';

@Component({
  selector: 'app-add-role-permission',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    CardModule,
    ToastModule
  ],
  templateUrl: './add-role-permission.component.html',
  styleUrl: './add-role-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRolePermissionComponent implements OnInit {

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(ADD_ROLE_PERMISSION_INPUT_FIELDS_CONFIG);
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeCreateRole(formData);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(FORM_VALIDATION_MESSAGES.FORM_INVALID);
      this.logger.warn('Add role form validation failed');
      return false;
    }
    return true;
  }

  private executeCreateRole(formData: any): void {
    this.isSubmitting.set(true);
    this.form.disable();

    // Simulate API call
    setTimeout(() => {
      this.notificationService.success('Role created successfully!');
      this.isSubmitting.set(false);
      this.form.enable();
      this.router.navigate([`/${ROUTE_BASE_PATHS.SETTINGS.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE}`]);
    }, 1500);
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Role Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private prepareFormData(): any {
    const formData = this.form.getData();
    return {
      roleName: formData['roleName'],
      description: formData['description'],
    };
  }
} 