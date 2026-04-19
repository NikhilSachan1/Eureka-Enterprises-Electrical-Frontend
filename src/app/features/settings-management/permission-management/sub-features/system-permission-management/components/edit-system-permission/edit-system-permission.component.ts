import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import {
  ISystemPermissionEditFormDto,
  ISystemPermissionGetBaseResponseDto,
} from '../../types/system-permission.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SystemPermissionService } from '../../services/system-permission.service';
import { finalize } from 'rxjs';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { FormBase } from '@shared/base/form.base';
import { EDIT_SYSTEM_PERMISSION_FORM_CONFIG } from '../../config/form/edit-system-permission.config';

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
export class EditSystemPermissionComponent
  extends FormBase<ISystemPermissionEditFormDto>
  implements OnInit
{
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialSystemPermissionData =
    signal<ISystemPermissionEditFormDto | null>(null);

  ngOnInit(): void {
    this.loadSystemPermissionDataFromRoute();

    this.form = this.formService.createForm<ISystemPermissionEditFormDto>(
      EDIT_SYSTEM_PERMISSION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialSystemPermissionData(),
      }
    );
  }

  private loadSystemPermissionDataFromRoute(): void {
    const routeStateData =
      this.routerNavigationService.getRouterStateData<ISystemPermissionGetBaseResponseDto>(
        'systemPermissionDetail'
      );

    if (!routeStateData) {
      this.logger.logUserAction('No system permission data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledSystemPermissionData =
      this.preparePrefilledFormData(routeStateData);
    this.initialSystemPermissionData.set(prefilledSystemPermissionData);
  }

  private preparePrefilledFormData(
    routeStateData: ISystemPermissionGetBaseResponseDto
  ): ISystemPermissionEditFormDto {
    const { module, label, description } = routeStateData;
    const moduleAction = this.getModuleActionFromLabel(label, module);
    return {
      moduleName: module,
      moduleAction,
      permissionDescription: description,
    };
  }

  private getModuleActionFromLabel(label: string, moduleName: string): string {
    const escapedModule = moduleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const actionPart = label
      .replace(new RegExp(`\\s+${escapedModule}$`, 'i'), '')
      .trim();
    return (
      actionPart.replace(/\s+/g, '_').toLowerCase() ||
      label.replace(/\s+/g, '_').toLowerCase()
    );
  }

  protected override handleSubmit(): void {
    const systemPermissionId = this.activatedRoute.snapshot.params[
      'systemPermissionId'
    ] as string;
    if (!systemPermissionId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditSystemPermission(formData, systemPermissionId);
  }

  private prepareFormData(): ISystemPermissionEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditSystemPermission(
    formData: ISystemPermissionEditFormDto,
    systemPermissionId: string
  ): void {
    this.loadingService.show({
      title: 'Updating system permission',
      message:
        "We're updating the system permission. This will just take a moment.",
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

  protected onReset(): void {
    this.onResetSingleForm(this.initialSystemPermissionData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit System Permission',
      subtitle: 'Edit a system permission in the system',
    };
  }
}
