import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterNavigationService } from '@shared/services/';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ADD_SYSTEM_PERMISSION_FORM_CONFIG } from '../../config';
import { SystemPermissionService } from '../../services/system-permission.service';
import { ISystemPermissionAddFormDto } from '../../types/system-permission.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { FormBase } from '@shared/base/form.base';

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
export class AddSystemPermissionComponent
  extends FormBase<ISystemPermissionAddFormDto>
  implements OnInit
{
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<ISystemPermissionAddFormDto>(
      ADD_SYSTEM_PERMISSION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddSystemPermission(formData);
  }

  private prepareFormData(): ISystemPermissionAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddSystemPermission(
    formData: ISystemPermissionAddFormDto
  ): void {
    this.loadingService.show({
      title: 'Adding system permission',
      message:
        "We're adding the system permission. This will just take a moment.",
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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Permission added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add system permission');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add System Permission',
      subtitle: 'Add a new system permission to the system',
    };
  }
}
