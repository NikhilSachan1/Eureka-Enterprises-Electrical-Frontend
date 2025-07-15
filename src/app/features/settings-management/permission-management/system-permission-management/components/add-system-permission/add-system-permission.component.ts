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
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoggerService } from '@core/services/logger.service';
import { FormService, LoadingService, NotificationService, RouterNavigationService } from '@shared/services/';
import { FORM_VALIDATION_MESSAGES, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  IEnhancedForm,
  IPageHeaderConfig,
} from '@shared/models';
import { ADD_SYSTEM_PERMISSION_FORM_CONFIG } from '@features/settings-management/permission-management/system-permission-management/config/form/add-system-permission-form.config';
import { MODULE_ACTIONS_DATA } from '@shared/config';
import { IAddSystemPermissionRequestDto } from '@features/settings-management/permission-management/system-permission-management/models/system-permission.api.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SystemPermissionService } from '@features/settings-management/permission-management/system-permission-management/services/system-permission.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-add-system-permission',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-system-permission.component.html',
  styleUrl: './add-system-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AddSystemPermissionComponent implements OnInit {
  
  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() =>
    this.getPageHeaderConfig(),
  );
  protected readonly isSubmitting = signal(false);

  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);

  ngOnInit(): void {
    this.form = this.formService.createForm(ADD_SYSTEM_PERMISSION_FORM_CONFIG);
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
    this.executeAddPermission(formData);
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID,
      );
      this.logger.warn('Add permission form validation failed');
      return false;
    }
    return true;
  }

  private executeAddPermission(formData: IAddSystemPermissionRequestDto): void {

    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Adding Permission',
      message: 'Please wait while we add the permission...',
    });
    this.form.disable();

    this.systemPermissionService
      .addSystemPermission(formData)
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
          this.notificationService.success('Permission added successfully', 'Success');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
          ];
          this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: (error) => {
          if (error?.name !== 'ZodError') {
            this.notificationService.error('Failed to add permission', 'Error');
          }
        },
      });
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Permission Form');
      this.form.reset();
      this.form.fieldConfigs['action'].selectConfig!.optionsDropdown = [];
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Permission',
      subtitle: 'Add a new permission to the system',
    };
  }

  private prepareFormData(): IAddSystemPermissionRequestDto {
    const formData = this.form.getData();
    return {
      module: formData['moduleName'],
      name: `${formData['action']}_${formData['moduleName']}`,
      label: `${formData['action']} ${formData['moduleName']}`,
      description: formData['comment'],
    };
  }
}
