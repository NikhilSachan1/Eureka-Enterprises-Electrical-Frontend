import { Component, OnInit, signal, inject, ChangeDetectionStrategy, DestroyRef, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../../../shared/components/page-header/page-header.component';
import { InputFieldComponent } from '../../../../../../shared/components/input-field/input-field.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { ToastModule } from 'primeng/toast';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { FormService } from '../../../../../../shared/services/form.service';
import { FORM_VALIDATION_MESSAGES } from '../../../../../../shared/constants';
import { IEnhancedForm, IPageHeaderConfig } from '../../../../../../shared/models';
import { ADD_ROLE_FORM_CONFIG } from '../../config/form/add-role-form.config';
import { RolePermissionService } from '../../services/role-permission.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-add-role',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    ToastModule
  ],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRoleComponent implements OnInit {

  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() => this.getPageHeaderConfig());
  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly rolePermissionService = inject(RolePermissionService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.form = this.formService.createForm(ADD_ROLE_FORM_CONFIG);
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeAddRole(formData);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(FORM_VALIDATION_MESSAGES.FORM_INVALID);
      this.logger.warn('Add role form validation failed');
      return false;
    }
    return true;
  }

  private executeAddRole(formData: any): void {
    this.isSubmitting.set(true);
    this.form.disable();

    this.rolePermissionService.addRole(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {},
        error: () => {}
      });
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Role Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Role',
      subtitle: 'Add a new role to the system',
    };
  }


  private prepareFormData(): any {
    const formData = this.form.getData();
    return {
      name: formData['roleName'],
      description: formData['comment'],
    };
  }
} 