import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { IPageHeaderConfig } from '@shared/models';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
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
import {
  ICategorizedPermissions,
  ISetPermissionData,
  SetPermissionComponent,
} from '../../../../shared/components/set-permission/set-permission.component';

@Component({
  selector: 'app-set-role-permission',
  imports: [SetPermissionComponent, PageHeaderComponent],
  templateUrl: './set-role-permission.component.html',
  styleUrl: './set-role-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetRolePermissionComponent implements OnInit {
  protected pageHeaderConfig = computed<Partial<IPageHeaderConfig>>(() =>
    this.getPageHeaderConfig()
  );

  protected readonly isSubmitting = signal(false);
  protected readonly editRolePermissionData = signal<Record<
    string,
    unknown
  > | null>(null);

  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly rolePermissionService = inject(RolePermissionService);
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
  ): Record<string, boolean> {
    const rolePermissionData = rolePermissionRouteData.records.reduce(
      (acc, record) => {
        acc[record.permissionId] = record.isActive;
        return acc;
      },
      {} as Record<string, boolean>
    );
    return rolePermissionData;
  }
}
