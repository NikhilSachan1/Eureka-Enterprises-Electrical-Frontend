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
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../../../../shared/components/page-header/page-header.component';
import { InputFieldComponent } from '../../../../../../shared/components/input-field/input-field.component';
import { ButtonComponent } from '../../../../../../shared/components/button/button.component';
import {
  NotificationService,
  FormService,
  RouterNavigationService,
  LoadingService,
} from '../../../../../../shared/services';
import { LoggerService } from '../../../../../../core/services/logger.service';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '../../../../../../shared/constants';
import {
  IEnhancedForm,
  IPageHeaderConfig,
} from '../../../../../../shared/models';
import {
  IEditSystemPermissionRequestDto,
  IGetSingleSystemPermissionListResponseDto,
} from '../../models/system-permission.api.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SystemPermissionService } from '../../services/system-permission.service';
import { finalize } from 'rxjs';
import { EDIT_SYSTEM_PERMISSION_FORM_CONFIG } from '../../config/form/edit-system-permission-form.config';

@Component({
  selector: 'app-edit-system-permission',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-system-permission.component.html',
  styleUrl: './edit-system-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class EditSystemPermissionComponent implements OnInit {

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() =>
    this.getPageHeaderConfig(),
  );
  protected readonly isSubmitting = signal(false);
  protected readonly editSystemPermissionData = signal<Record<string, any> | null>(null);

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadSystemPermissionDataFromRoute();
    this.form = this.formService.createForm(
      EDIT_SYSTEM_PERMISSION_FORM_CONFIG,
      this.editSystemPermissionData(),
    );
  }

  private loadSystemPermissionDataFromRoute() {
    
    const editSystemPermissionRouteData =
      this.routerNavigationService.getRouterStateData<IGetSingleSystemPermissionListResponseDto>(
        'permissionData',
      );

    if (!editSystemPermissionRouteData) {
      this.logger.logUserAction('No permission data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
      ];
      this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const editSystemPermissionData = {
      comment: editSystemPermissionRouteData.description,
    };

    this.editSystemPermissionData.set(editSystemPermissionData);
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    const permissionId = this.activatedRoute.snapshot.paramMap.get('permissionId');

    if (!permissionId) {
      this.logger.logUserAction('No permission id found in route');
      this.notificationService.error(FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG);
      return;
    }
    this.executeEditSystemPermission(formData, permissionId);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID,
      );
      this.logger.warn('Edit permission form validation failed');
      return false;
    }
    return true;
  }

  private executeEditSystemPermission(
    formData: IEditSystemPermissionRequestDto,
    permissionId: string,
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Updating Permission',
      message: 'Please wait while we update the permission...',
    });
    this.form.disable();

    this.systemPermissionService
      .updateSystemPermission(formData, permissionId)
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
          this.notificationService.success('Permission updated successfully', 'Success');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
          ];
          this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update permission', 'Error');
        }
      });
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Edit Permission Form');
      this.form.reset(this.editSystemPermissionData());
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Permission',
      subtitle: 'Edit a permission in the system',
    };
  }

  private prepareFormData(): IEditSystemPermissionRequestDto {
    const formData = this.form.getData();
    return {
      description: formData['comment'],
    };
  }
}
