import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig } from '@shared/types';
import { RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { finalize } from 'rxjs';
import { UserPermissionService } from '../../services/user-permission.service';
import {
  IUserPermissionsGetResponseDto,
  IUserPermissionsSetResponseDto,
} from '../../types/user-permissions.dto';
import { SetPermissionComponent } from '../../../../shared/components/set-permission/set-permission.component';
import {
  IDefaultPermissions,
  IMatrixModuleSaveEvent,
  IRolePermissionMatrixColumn,
} from '../../../../shared/types/set-permission.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { FormBase } from '@shared/base/form.base';

interface IUserPermissionNavigationState {
  userLabel?: string;
  userCode?: string;
}

@Component({
  selector: 'app-set-user-permission',
  imports: [SetPermissionComponent, PageHeaderComponent],
  templateUrl: './set-user-permission.component.html',
  styleUrl: './set-user-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetUserPermissionComponent extends FormBase implements OnInit {
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userPermissionService = inject(UserPermissionService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly userColumns = signal<IRolePermissionMatrixColumn[]>([]);
  protected readonly userDefaultPermissions = signal<
    Record<string, IDefaultPermissions>
  >({});
  protected readonly isPageReady = signal(false);

  private userId = '';

  ngOnInit(): void {
    this.loadUserPermissionMatrixData();
  }

  protected override handleSubmit(): void {
    // Matrix saves per module; no global submit action.
  }

  protected onMatrixModuleSave(event: IMatrixModuleSaveEvent): void {
    const [userUpdate] = event.roleUpdates;
    if (!userUpdate) {
      return;
    }

    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Updating user permissions',
      message:
        "We're saving permission changes for this user. This will just take a moment.",
    });

    this.userPermissionService
      .setUserPermission({
        userId: userUpdate.roleId,
        ...userUpdate.categorizedPermissions,
      })
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUserPermissionsSetResponseDto) => {
          if (response.failureCount > 0) {
            this.notificationService.bulkOperationFromApiResponse(
              response,
              'user permission',
              'update'
            );
            return;
          }

          this.commitMatrixModuleSave(event);
          this.notificationService.success(
            'Module permissions updated successfully.'
          );
        },
        error: () => {
          this.notificationService.error('Failed to update user permissions.');
        },
      });
  }

  private loadUserPermissionMatrixData(): void {
    const userPermissionRouteData = this.activatedRoute.snapshot.data[
      'userPermissionData'
    ] as IUserPermissionsGetResponseDto | null;

    if (!userPermissionRouteData) {
      this.logger.logUserAction('No user permission data found in route');
      this.navigateBackToUsers();
      return;
    }

    this.userId = userPermissionRouteData.userId;
    const userColumn = this.buildUserColumn(userPermissionRouteData);
    const defaultPermissions = this.buildUserDefaultPermissions(
      userPermissionRouteData
    );

    this.userColumns.set([userColumn]);
    this.userDefaultPermissions.set({
      [this.userId]: defaultPermissions,
    });
    this.isPageReady.set(true);
  }

  private buildUserColumn(
    userPermissionRouteData: IUserPermissionsGetResponseDto
  ): IRolePermissionMatrixColumn {
    const navigationState =
      this.routerNavigationService.getRouterStateData<IUserPermissionNavigationState>(
        'userPermissionContext'
      );

    return {
      id: userPermissionRouteData.userId,
      label:
        navigationState?.userLabel ??
        userPermissionRouteData.role?.label ??
        'User',
      name:
        navigationState?.userCode ??
        userPermissionRouteData.role?.name ??
        userPermissionRouteData.userId,
    };
  }

  private buildUserDefaultPermissions(
    userPermissionRouteData: IUserPermissionsGetResponseDto
  ): IDefaultPermissions {
    return userPermissionRouteData.permissions
      .flatMap(module => module.permissions)
      .reduce(
        (acc, permission) => ({
          ...acc,
          [permission.id]: {
            value: permission.isGranted,
            source: permission.source,
          },
        }),
        {} as IDefaultPermissions
      );
  }

  private commitMatrixModuleSave(event: IMatrixModuleSaveEvent): void {
    this.userDefaultPermissions.update(current => {
      const next = { ...current };

      event.roleUpdates.forEach(({ roleId, categorizedPermissions }) => {
        const userPermissions = { ...(next[roleId] ?? {}) };

        categorizedPermissions.newPermissions.forEach(permissionId => {
          userPermissions[permissionId] = { value: true, source: 'override' };
        });
        categorizedPermissions.revokedPermissions.forEach(permissionId => {
          userPermissions[permissionId] = { value: false, source: 'override' };
        });
        categorizedPermissions.defaultPermissions.forEach(permissionId => {
          const existingSource =
            userPermissions[permissionId]?.source ?? 'role';
          userPermissions[permissionId] = {
            value: true,
            source: existingSource,
          };
        });

        next[roleId] = userPermissions;
      });

      return next;
    });
  }

  private navigateBackToUsers(): void {
    void this.routerNavigationService.navigateToRoute([
      ROUTE_BASE_PATHS.SETTINGS.BASE,
      ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
      ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
    ]);
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    const [userColumn] = this.userColumns();

    return {
      title: 'Set User Permissions',
      subtitle: userColumn
        ? `Permissions are fixed on the left; use Update on each module to save changes for ${userColumn.label}.`
        : 'Set permissions for the selected user.',
    };
  }
}
