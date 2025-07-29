import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { IPageHeaderConfig } from '@shared/models';
import { ActivatedRoute } from '@angular/router';
import {
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { LoggerService } from '@core/services';
import { FORM_VALIDATION_MESSAGES, ROUTE_BASE_PATHS } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RolePermissionService } from '../../services/role-permission.service';
import {
  IRolePermissionsGetResponseDto,
  IRolePermissionsSetRequestDto,
} from '../../types/role-permission.dto';
import { SetPermissionComponent } from '../../../../shared/components/set-permission/set-permission.component';
import {
  ICategorizedPermissions,
  ISetPermissionData,
  IDefaultPermissions,
} from '../../../../shared/types/set-permission.interface';
import { PreventReloadComponent } from '@shared/components/prevent-reload/prevent-reload.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

@Component({
  selector: 'app-set-role-permission',
  imports: [SetPermissionComponent, PageHeaderComponent],
  templateUrl: './set-role-permission.component.html',
  styleUrl: './set-role-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetRolePermissionComponent
  extends PreventReloadComponent
  implements OnInit
{
  readonly setPermissionComponent = viewChild.required(SetPermissionComponent);

  protected override readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly rolePermissionService = inject(RolePermissionService);
  private readonly destroyRef = inject(DestroyRef);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  protected readonly isSubmitting = signal(false);
  protected readonly editRolePermissionData =
    signal<IDefaultPermissions | null>(null);

  override ngOnInit(): void {
    this.loadRolePermissionDataFromRoute();
  }

  canDeactivate(): boolean {
    if (this.setPermissionComponent()?.hasUnsavedChanges()) {
      this.logger.info(
        'Set Role Permission Component: Form has unsaved changes'
      );
      return false;
    }

    this.logger.info(
      'Set Role Permission Component: Form has no unsaved changes'
    );
    return true;
  }

  protected onSubmit(setPermissionData: ISetPermissionData): void {
    if (this.isSubmitting()) {
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

    const { categorizedPermissions } = setPermissionData;

    const formData = this.prepareFormData(categorizedPermissions, roleId);
    this.executeSetRolePermission(formData);
  }

  private executeSetRolePermission(
    formData: IRolePermissionsSetRequestDto
  ): void {
    this.isSubmitting.set(true);
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

    const rolePermissionData = this.prepareRolePermissionData(
      rolePermissionRouteData
    );
    this.editRolePermissionData.set(rolePermissionData);
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Set Role Permissions',
      subtitle: 'Set the permissions for the role',
    };
  }

  private prepareFormData(
    categorizedPermissions: ICategorizedPermissions,
    roleId: string
  ): IRolePermissionsSetRequestDto {
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

  private prepareRolePermissionData(
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
}
