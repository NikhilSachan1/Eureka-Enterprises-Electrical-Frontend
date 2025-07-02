import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IEnhancedForm,
  IPageHeaderConfig,
} from '../../../../../../shared/models';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '../../../../../../shared/services';
import { RolePermissionService } from '../../services/role-permission.service';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { EDIT_ROLE_FORM_CONFIG } from '../../config/form/edit-role-form.config';
import {
  IEditRoleManagementRequestDto,
  IGetSingleRoleListResponseDto,
} from '../../models/role-permission.api.model';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
} from '../../../../../../shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../../../../../shared/components/page-header/page-header.component';
import { InputFieldComponent } from '../../../../../../shared/components/input-field/input-field.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-role',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-role.component.html',
  styleUrl: './edit-role.component.scss',
})

export class EditRoleComponent {
  
  protected form!: IEnhancedForm;
  
  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() =>
    this.getPageHeaderConfig(),
  );
  protected readonly isSubmitting = signal(false);
  protected readonly editRoleData = signal<Record<string, any> | null>(null);

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly roleService = inject(RolePermissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadRoleDataFromRoute();
    this.form = this.formService.createForm(
      EDIT_ROLE_FORM_CONFIG,
      this.editRoleData(),
    );
  }

  private loadRoleDataFromRoute() {
      
    const editRoleRouteData =
      this.routerNavigationService.getRouterStateData<IGetSingleRoleListResponseDto>(
        'roleData',
      );

    if (!editRoleRouteData) {
      this.logger.logUserAction('No role data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
      ];
      this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const editRoleData = {
      roleName: editRoleRouteData.label,
      comment: editRoleRouteData.description,
    };

    this.editRoleData.set(editRoleData);
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    const roleId = this.activatedRoute.snapshot.paramMap.get('id');

    if (!roleId) {
      this.logger.logUserAction('No role id found in route');
      this.notificationService.error(FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG);
      return;
    }
    this.executeEditRole(formData, roleId);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID,
      );
      this.logger.warn('Edit role form validation failed');
      return false;
    }
    return true;
  }

  private executeEditRole(
    formData: IEditRoleManagementRequestDto,
    roleId: string,
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Updating Role',
      message: 'Please wait while we update the role...',
    });
    this.form.disable();

    this.roleService
      .updateRole(formData, roleId)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Role updated successfully', 'Success');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
          ];
          this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update role', 'Error');
        },
      });
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Edit Role Form');
      this.form.reset(this.editRoleData());
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Role',
      subtitle: 'Edit a role in the system',
    };
  }

  private prepareFormData(): IEditRoleManagementRequestDto {
    const formData = this.form.getData();
    return {
      description: formData['comment'],
      label: formData['roleName'],
    };
  }
}
