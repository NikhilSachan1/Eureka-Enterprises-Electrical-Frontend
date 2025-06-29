import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { IEnhancedForm, IPageHeaderConfig } from '../../../../../../shared/models';
import { ActivatedRoute } from '@angular/router';
import { FormService, NotificationService, RouterService } from '../../../../../../shared/services';
import { RolePermissionService } from '../../services/role-permission.service';
import { LoggerService } from '../../../../../../core/services/logger.service';
import { EDIT_ROLE_FORM_CONFIG } from '../../config/form/edit-role-form.config';
import { IEditRoleManagementRequestDto, IGetSingleRoleListResponseDto } from '../../models/role-permission.api.model';
import { FORM_VALIDATION_MESSAGES, ROUTE_BASE_PATHS, ROUTES } from '../../../../../../shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from "../../../../../../shared/components/page-header/page-header.component";
import { InputFieldComponent } from "../../../../../../shared/components/input-field/input-field.component";
import { ButtonComponent } from "../../../../../../shared/components/button/button.component";
import { ToastModule } from 'primeng/toast';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-role',
  imports: [
    PageHeaderComponent, 
    InputFieldComponent, 
    ButtonComponent, 
    ToastModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-role.component.html',
  styleUrl: './edit-role.component.scss'
})
export class EditRoleComponent {

  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() => this.getPageHeaderConfig());
  protected form!: IEnhancedForm;
  protected readonly isSubmitting = signal(false);
  protected readonly editRoleData = signal<Record<string, any> | null>(null);

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly roleService = inject(RolePermissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerService = inject(RouterService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadRoleDataFromRoute();
    this.form = this.formService.createForm(EDIT_ROLE_FORM_CONFIG, this.editRoleData());
  }

  private loadRoleDataFromRoute() {
    const editRoleRouteData = this.routerService.getRouterDataFromState<IGetSingleRoleListResponseDto>('roleData');

    if (!editRoleRouteData) {
      this.routerService.navigate([ROUTE_BASE_PATHS.SETTINGS.BASE, ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE, ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM, ROUTES.SETTINGS.PERMISSION.SYSTEM.LIST]);
      return;
    }

    const editRoleData = {
      comment: editRoleRouteData.description,
    };

    this.editRoleData.set(editRoleData);
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    const roleId = this.route.snapshot.paramMap.get('id') as string;
    this.executeEditRole(formData, roleId);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(FORM_VALIDATION_MESSAGES.FORM_INVALID);
      this.logger.warn('Edit role form validation failed');
      return false;
    }
    return true;
  }

  private executeEditRole(formData: IEditRoleManagementRequestDto, roleId: string): void {

    this.isSubmitting.set(true);
    this.form.disable();

    this.roleService.updateRole(formData, roleId).pipe(
      finalize(() => {
        this.isSubmitting.set(false);
        this.form.enable();
      }),
      takeUntilDestroyed(this.destroyRef)
    )
      .subscribe({
        next: () => { },
        error: (error) => { }
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
    };
  }


}
