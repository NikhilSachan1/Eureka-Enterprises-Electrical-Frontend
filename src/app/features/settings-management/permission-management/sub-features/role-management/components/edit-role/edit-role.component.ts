import {
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/models';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { LoggerService } from '@core/services';
import { FORM_VALIDATION_MESSAGES, ROUTE_BASE_PATHS } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import {
  IRoleEditRequestDto,
  IRoleGetBaseResponseDto,
} from '../../types/role.dto';
import { ROLE_FORM_EDIT_CONFIG } from '../../config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { PreventReloadComponent } from '@shared/components/prevent-reload/prevent-reload.component';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditRoleComponent
  extends PreventReloadComponent
  implements OnInit
{
  private readonly formService = inject(FormService);
  protected override readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly roleService = inject(RoleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);
  protected readonly editRolePrefilledData = signal<Record<
    string,
    unknown
  > | null>(null);

  override ngOnInit(): void {
    this.loadPrefilledRoleDataFromRoute();
    this.form = this.formService.createForm(
      ROLE_FORM_EDIT_CONFIG,
      this.editRolePrefilledData()
    );
  }

  canDeactivate(): boolean {
    if (this.form.isDirty()) {
      this.logger.info('Edit Role Component: Form has unsaved changes');
      return false;
    }

    this.logger.info('Edit Role Component: Form has no unsaved changes');
    return true;
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    const roleId = this.activatedRoute.snapshot.paramMap.get('roleId');

    if (!roleId) {
      this.logger.logUserAction('No role id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.executeEditRole(formData, roleId);
  }

  private executeEditRole(formData: IRoleEditRequestDto, roleId: string): void {
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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Role updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update role');
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Edit role form validation failed');
      return false;
    }
    return true;
  }

  private loadPrefilledRoleDataFromRoute(): void {
    const editRoleRouteData =
      this.routerNavigationService.getRouterStateData<IRoleGetBaseResponseDto>(
        'roleData'
      );

    if (!editRoleRouteData) {
      this.logger.logUserAction('No role data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const editRolePrefilledData = this.preparePrefilledData(editRoleRouteData);
    this.editRolePrefilledData.set(editRolePrefilledData);
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Edit Role Form');
      this.form.reset(this.editRolePrefilledData() ?? {});
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

  private preparePrefilledData(
    editRolePrefilledData: IRoleGetBaseResponseDto
  ): Record<string, unknown> {
    const { label, description } = editRolePrefilledData;
    return {
      roleName: label,
      comment: description,
    };
  }

  private prepareFormData(): IRoleEditRequestDto {
    const { comment, roleName } = this.form.getData() as Record<string, string>;
    return {
      description: comment,
      label: roleName,
    };
  }
}
