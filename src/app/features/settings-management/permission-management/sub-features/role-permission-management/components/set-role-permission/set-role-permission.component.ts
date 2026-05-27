import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig } from '@shared/types';
import { RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { finalize, forkJoin, of, switchMap } from 'rxjs';
import { RolePermissionService } from '../../services/role-permission.service';
import { IRolePermissionsSetResponseDto } from '../../types/role-permission.dto';
import { SetPermissionComponent } from '../../../../shared/components/set-permission/set-permission.component';
import {
  IDefaultPermissions,
  IMatrixModuleSaveEvent,
  IRolePermissionMatrixColumn,
} from '../../../../shared/types/set-permission.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { FormBase } from '@shared/base/form.base';
import { RoleService } from '../../../role-management/services/role.service';
import { IRoleGetBaseResponseDto } from '../../../role-management/types/role.dto';

const ROLE_LIST_PAGE_SIZE = 500;

@Component({
  selector: 'app-set-role-permission',
  imports: [SetPermissionComponent, PageHeaderComponent],
  templateUrl: './set-role-permission.component.html',
  styleUrl: './set-role-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetRolePermissionComponent extends FormBase implements OnInit {
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly rolePermissionService = inject(RolePermissionService);
  private readonly roleService = inject(RoleService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly roleColumns = signal<IRolePermissionMatrixColumn[]>([]);
  protected readonly roleDefaultPermissions = signal<
    Record<string, IDefaultPermissions>
  >({});
  protected readonly isPageReady = signal(false);

  ngOnInit(): void {
    this.loadRolePermissionMatrixData();
  }

  protected override handleSubmit(): void {
    // Matrix saves per module; no global submit action.
  }

  protected onMatrixModuleSave(event: IMatrixModuleSaveEvent): void {
    if (!event.roleUpdates.length) {
      return;
    }

    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Updating role permissions',
      message:
        "We're saving permission changes for the selected roles. This will just take a moment.",
    });

    forkJoin(
      event.roleUpdates.map(update =>
        this.rolePermissionService.setRolePermission({
          roleId: update.roleId,
          ...update.categorizedPermissions,
        })
      )
    )
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: responses => {
          const failed = responses.some(
            (response: IRolePermissionsSetResponseDto) =>
              response.failureCount > 0
          );

          if (failed) {
            this.notificationService.error(
              'Some role permission updates failed. Please review and try again.'
            );
            return;
          }

          this.commitMatrixModuleSave(event);
          this.notificationService.success(
            'Module permissions updated successfully.'
          );
        },
        error: () => {
          this.notificationService.error('Failed to update role permissions.');
        },
      });
  }

  private loadRolePermissionMatrixData(): void {
    this.isPageReady.set(false);
    this.loadingService.show({
      title: 'Loading role permissions',
      message:
        "We're loading roles and permissions. This will just take a moment.",
    });

    this.roleService
      .getRoleList({ page: 1, pageSize: ROLE_LIST_PAGE_SIZE })
      .pipe(
        switchMap(roleResponse => {
          const roles = roleResponse.records.map(role =>
            this.mapRoleColumn(role)
          );

          return forkJoin({
            roles: of(roles),
            rolePermissions: roles.length
              ? forkJoin(
                  roles.map(role =>
                    this.rolePermissionService.getRolePermission({
                      roleId: role.id,
                    })
                  )
                )
              : of([]),
          });
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isPageReady.set(true);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ roles, rolePermissions }) => {
          this.roleColumns.set(roles);
          this.roleDefaultPermissions.set(
            this.buildRoleDefaultPermissions(roles, rolePermissions)
          );
          this.logger.logUserAction('Role permission matrix loaded');
        },
        error: error => {
          this.roleColumns.set([]);
          this.roleDefaultPermissions.set({});
          this.logger.error('Failed to load role permission matrix', error);
          this.notificationService.error(
            'Could not load role permissions. Please try again.'
          );
          this.navigateBackToRoles();
        },
      });
  }

  private buildRoleDefaultPermissions(
    roles: IRolePermissionMatrixColumn[],
    rolePermissionsResponses: {
      records: { permissionId: string; isActive: boolean }[];
    }[]
  ): Record<string, IDefaultPermissions> {
    return roles.reduce<Record<string, IDefaultPermissions>>(
      (acc, role, index) => {
        acc[role.id] =
          rolePermissionsResponses[index]?.records.reduce(
            (permissions, record) => ({
              ...permissions,
              [record.permissionId]: { value: record.isActive },
            }),
            {} as IDefaultPermissions
          ) ?? {};

        return acc;
      },
      {}
    );
  }

  private commitMatrixModuleSave(event: IMatrixModuleSaveEvent): void {
    this.roleDefaultPermissions.update(current => {
      const next = { ...current };

      event.roleUpdates.forEach(({ roleId, categorizedPermissions }) => {
        const rolePermissions = { ...(next[roleId] ?? {}) };

        categorizedPermissions.newPermissions.forEach(permissionId => {
          rolePermissions[permissionId] = { value: true };
        });
        categorizedPermissions.revokedPermissions.forEach(permissionId => {
          rolePermissions[permissionId] = { value: false };
        });
        categorizedPermissions.defaultPermissions.forEach(permissionId => {
          rolePermissions[permissionId] = { value: true };
        });

        next[roleId] = rolePermissions;
      });

      return next;
    });
  }

  private mapRoleColumn(
    role: IRoleGetBaseResponseDto
  ): IRolePermissionMatrixColumn {
    return {
      id: role.id,
      label: role.label,
      name: role.name,
    };
  }

  private navigateBackToRoles(): void {
    void this.routerNavigationService.navigateToRoute([
      ROUTE_BASE_PATHS.SETTINGS.BASE,
      ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
      ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
    ]);
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Set Role Permissions',
      subtitle:
        'Permissions are fixed on the left; scroll roles horizontally. Use Update on each module to save.',
    };
  }
}
