import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ICategorizedPermissions, ISetPermissionData, SetPermissionComponent } from "@features/settings-management/permission-management/shared/set-permission/component/set-permission.component";
import { IPageHeaderConfig } from '@shared/models';
import { PageHeaderComponent } from "@shared/components/page-header/page-header.component";
import { ActivatedRoute } from '@angular/router';
import { RouterNavigationService } from '@shared/services';
import { LoggerService } from '@core/services';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { IGetRolePermissionsResponseDto, ISetRolePermissionRequestDto } from '@features/settings-management/permission-management/role-management/models/role-permission.api.model';
import { NotificationService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { LoadingService } from '@shared/services';
import { RoleManagementService } from '@features/settings-management/permission-management/role-management/services/role-management.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-set-role-permission',
  imports: [SetPermissionComponent, PageHeaderComponent],
  templateUrl: './set-role-permission.component.html',
  styleUrl: './set-role-permission.component.scss'
})
export class SetRolePermissionComponent implements OnInit {

  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() =>
    this.getPageHeaderConfig(),
  );

  protected readonly isSubmitting = signal(false);
  protected readonly editRolePermissionData = signal<Record<string, any> | null>(null);

  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly roleManagementService = inject(RoleManagementService);
  private readonly destroyRef = inject(DestroyRef);

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Set Role Permissions',
      subtitle: 'Set the permissions for the role',
    };
  }

  ngOnInit(): void {
    this.loadRolePermissionDataFromRoute();
  }

  private loadRolePermissionDataFromRoute(): void {
    
    const rolePermissionRouteData = this.activatedRoute.snapshot.data['rolePermissionData'] as IGetRolePermissionsResponseDto | null;
    
    if (!rolePermissionRouteData) {
      this.logger.logUserAction('No role permission data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
      ];
      this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const rolePermissionData = this.prepareRolePermissionData(rolePermissionRouteData);
    this.editRolePermissionData.set(rolePermissionData);
  }

  protected onSubmit(setPermissionData: ISetPermissionData): void {

    if (this.isSubmitting()) {
      return;
    }

    const roleId = this.activatedRoute.snapshot.paramMap.get('roleId');
    
    if (!roleId) {
      this.logger.logUserAction('No role id found in route');
      this.notificationService.error(FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG);
      return;
    }

    const { moduleWisePermissions, categorizedPermissions } = setPermissionData;

    const formData = this.prepareFormData(categorizedPermissions, roleId);
    this.executeSetRolePermission(formData);
  }

  private executeSetRolePermission(formData: ISetRolePermissionRequestDto): void {

    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Updating Role Permission',
      message: 'Please wait while we update the role permission...',
    });

    this.roleManagementService.setRolePermission(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Role permission updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.SETTINGS.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
          ];
          this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update role permission');
        },
      });
  }

  private prepareFormData(categorizedPermissions: ICategorizedPermissions, roleId: string): ISetRolePermissionRequestDto {
    const rolePermissions = [
      ...categorizedPermissions.newPermissions.map(permissionId => ({
        permissionId,
        isActive: true,
      })),
      ...categorizedPermissions.revokedPermissions.map(permissionId => ({
        permissionId,
        isActive: false,
      })),
    ];
    return {
      roleId,
      rolePermissions,
    };
  }

  private prepareRolePermissionData(rolePermissionRouteData: IGetRolePermissionsResponseDto): Record<string, any> {
    const rolePermissionData = rolePermissionRouteData.records.reduce((acc, record) => {
      acc[record.permissionId] = record.isActive;
      return acc;
    }, {} as Record<string, boolean>);
    return rolePermissionData;
  }
}