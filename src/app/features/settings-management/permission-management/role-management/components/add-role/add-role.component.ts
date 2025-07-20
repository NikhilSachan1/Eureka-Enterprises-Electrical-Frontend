import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  PageHeaderComponent,
  InputFieldComponent,
  ButtonComponent,
} from '@shared/components';
import { LoggerService } from '@core/services';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services/';
import { FORM_VALIDATION_MESSAGES, ROUTE_BASE_PATHS } from '@shared/constants';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/models';
import { ADD_ROLE_FORM_CONFIG } from '@features/settings-management/permission-management/role-management/config/form/add-role-management-form.config';
import { RoleManagementService } from '@features/settings-management/permission-management/role-management/services/role-management.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IAddRoleManagementRequestDto } from '@features/settings-management/permission-management/role-management/models/role-management.api.model';

@Component({
  selector: 'app-add-role',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRoleComponent implements OnInit {
  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() =>
    this.getPageHeaderConfig()
  );
  protected readonly isSubmitting = signal(false);

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly roleManagementService = inject(RoleManagementService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);

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
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Add role form validation failed');
      return false;
    }
    return true;
  }

  private executeAddRole(formData: IAddRoleManagementRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Adding Role',
      message: 'Please wait while we add the role...',
    });
    this.form.disable();

    this.roleManagementService
      .addRole(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Role added successfully',
            'Success'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add role', 'Error');
        },
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

  private prepareFormData(): IAddRoleManagementRequestDto {
    const { roleName, comment } = this.form.getData();
    return {
      name: roleName as string,
      description: comment as string,
      label: roleName as string,
    };
  }
}
