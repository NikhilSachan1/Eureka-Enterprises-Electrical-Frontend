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
import {
  NotificationService,
  FormService,
  RouterNavigationService,
  LoadingService,
} from '@shared/services';
import { LoggerService } from '@core/services';
import { FORM_VALIDATION_MESSAGES, ROUTE_BASE_PATHS } from '@shared/constants';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import {
  ISystemPermissionEditRequestDto,
  ISystemPermissionGetBaseResponseDto,
} from '../../types/system-permission.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SystemPermissionService } from '../../services/system-permission.service';
import { finalize } from 'rxjs';
import { SYSTEM_PERMISSION_FORM_EDIT_CONFIG } from '../../config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

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
  private readonly formService = inject(FormService);
  protected readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);
  protected readonly editSystemPermissionPrefilledData = signal<Record<
    string,
    unknown
  > | null>(null);

  ngOnInit(): void {
    this.loadPrefilledSystemPermissionDataFromRoute();
    this.form = this.formService.createForm(
      SYSTEM_PERMISSION_FORM_EDIT_CONFIG,
      this.editSystemPermissionPrefilledData()
    );
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    const systemPermissionId =
      this.activatedRoute.snapshot.paramMap.get('systemPermissionId');

    if (!systemPermissionId) {
      this.logger.logUserAction('No system permission id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.executeEditSystemPermission(formData, systemPermissionId);
  }

  private executeEditSystemPermission(
    formData: ISystemPermissionEditRequestDto,
    systemPermissionId: string
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Updating System Permission',
      message: 'Please wait while we update the system permission...',
    });
    this.form.disable();

    this.systemPermissionService
      .updateSystemPermission(formData, systemPermissionId)
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
            'System permission updated successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update system permission');
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Edit system permission form validation failed');
      return false;
    }
    return true;
  }

  private loadPrefilledSystemPermissionDataFromRoute(): void {
    const editSystemPermissionRouteData =
      this.routerNavigationService.getRouterStateData<ISystemPermissionGetBaseResponseDto>(
        'systemPermissionData'
      );

    if (!editSystemPermissionRouteData) {
      this.logger.logUserAction('No system permission data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const editSystemPermissionPrefilledData = this.preparePrefilledData(
      editSystemPermissionRouteData
    );
    this.editSystemPermissionPrefilledData.set(
      editSystemPermissionPrefilledData
    );
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Edit System Permission Form');
      this.form.reset(this.editSystemPermissionPrefilledData() ?? {});
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit System Permission',
      subtitle: 'Edit a system permission in the system',
    };
  }

  private preparePrefilledData(
    editSystemPermissionPrefilledData: ISystemPermissionGetBaseResponseDto
  ): Record<string, unknown> {
    const { description } = editSystemPermissionPrefilledData;
    return {
      comment: description,
    };
  }

  private prepareFormData(): ISystemPermissionEditRequestDto {
    const { comment } = this.form.getData() as Record<string, string>;
    return {
      description: comment,
    };
  }
}
