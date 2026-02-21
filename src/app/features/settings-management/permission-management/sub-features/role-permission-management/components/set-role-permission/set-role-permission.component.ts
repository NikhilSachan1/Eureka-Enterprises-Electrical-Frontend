import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { IPageHeaderConfig } from '@shared/types';
import { ActivatedRoute } from '@angular/router';
import { RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RolePermissionService } from '../../services/role-permission.service';
import {
  IRolePermissionsGetResponseDto,
  IRolePermissionsSetFormDto,
} from '../../types/role-permission.dto';
import { SetPermissionComponent } from '../../../../shared/components/set-permission/set-permission.component';
import {
  ICategorizedPermissions,
  IDefaultPermissions,
  ISetPermissionData,
} from '../../../../shared/types/set-permission.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-set-role-permission',
  imports: [SetPermissionComponent, PageHeaderComponent],
  templateUrl: './set-role-permission.component.html',
  styleUrl: './set-role-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetRolePermissionComponent extends FormBase implements OnInit {
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly rolePermissionService = inject(RolePermissionService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialRolePermissionData =
    signal<IDefaultPermissions | null>(null);
  private readonly latestPermissionsData = signal<ISetPermissionData | null>(
    null
  );

  ngOnInit(): void {
    this.loadRolePermissionDataFromRoute();
  }

  private loadRolePermissionDataFromRoute(): void {
    const rolePermissionRouteData = this.activatedRoute.snapshot.data[
      'rolePermissionData'
    ] as IRolePermissionsGetResponseDto | null;

    if (!rolePermissionRouteData) {
      this.logger.logUserAction('No role permission data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const rolePermissionData = this.preparePrefilledFormData(
      rolePermissionRouteData
    );
    this.initialRolePermissionData.set(rolePermissionData);
  }

  private preparePrefilledFormData(
    rolePermissionRouteData: IRolePermissionsGetResponseDto
  ): IDefaultPermissions {
    return rolePermissionRouteData.records.reduce(
      (acc, record) => ({
        ...acc,
        [record.permissionId]: {
          value: record.isActive,
        },
      }),
      {} as IDefaultPermissions
    );
  }

  protected override handleSubmit(): void {
    const data = this.latestPermissionsData();
    if (!data) {
      return;
    }
    const roleId = this.activatedRoute.snapshot.paramMap.get('roleId');
    if (!roleId) {
      this.logger.logUserAction('No role id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    const formData = this.prepareFormData(data.categorizedPermissions, roleId);
    this.executeSetRolePermission(formData);
  }

  protected onModulePermissionsSubmit(
    setPermissionData: ISetPermissionData
  ): void {
    this.latestPermissionsData.set(setPermissionData);
    this.handleSubmit();
  }

  private prepareFormData(
    categorizedPermissions: ICategorizedPermissions,
    roleId: string
  ): IRolePermissionsSetFormDto {
    return {
      roleId,
      ...categorizedPermissions,
    };
  }

  private executeSetRolePermission(formData: IRolePermissionsSetFormDto): void {
    this.loadingService.show({
      title: 'Updating Role Permission',
      message: 'Please wait while we update the role permission...',
    });

    this.rolePermissionService
      .setRolePermission(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Role permission updated successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update role permission');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialRolePermissionData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Set Role Permissions',
      subtitle: 'Set the permissions for the role',
    };
  }
}
