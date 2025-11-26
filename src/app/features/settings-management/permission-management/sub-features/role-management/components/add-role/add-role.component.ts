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
import { LoggerService } from '@core/services';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services/';
import { FORM_VALIDATION_MESSAGES, ROUTE_BASE_PATHS } from '@shared/constants';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IRoleAddRequestDto } from '../../types/role.dto';
import { RoleService } from '../../services/role.service';
import { ROLE_FORM_ADD_CONFIG } from '../../config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

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
  private readonly formService = inject(FormService);
  protected readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly roleService = inject(RoleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(ROLE_FORM_ADD_CONFIG);
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeAddRole(formData);
  }

  private executeAddRole(formData: IRoleAddRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Adding Role',
      message: 'Please wait while we add the role...',
    });
    this.form.disable();

    this.roleService
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
          this.notificationService.success('Role added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add role');
        },
      });
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

  private prepareFormData(): IRoleAddRequestDto {
    const { roleName, comment } = this.form.getData() as Record<string, string>;
    return {
      name: roleName,
      description: comment,
      label: roleName,
    };
  }
}
