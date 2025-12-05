import { inject, Injectable } from '@angular/core';
import { AuthService } from '@features/auth-management/services/auth.service';
import { IAppPermission } from '@features/settings-management/permission-management/sub-features/user-permission-management/types/user-permission.interface';
import { FEATURE_VISIBILITY_CONFIG } from '@core/config/feature-visibility.config';
import { replaceTextWithSeparator } from '@shared/utility';

@Injectable({
  providedIn: 'root',
})
export class AppPermissionService {
  private readonly authService = inject(AuthService);

  private permissions: IAppPermission = [];
  private uiPermissions: IAppPermission = [];

  setPermissions(permissions: IAppPermission): void {
    this.permissions = permissions;
  }

  hasPermission(permissionName: string): boolean {
    // TODO: Later when user/Role permission management is implemented, we will remove that and switch to backend based permission management.
    return (
      this.permissions.includes(permissionName) ||
      this.uiPermissions.includes(permissionName)
    );
  }

  // TODO: Later when user/Role permission management is implemented, we will remove that and switch to backend based permission management.
  setUIPermissions(): void {
    this.uiPermissions = this.loadUiPermissionsForCurrentUser();
  }

  // TODO: Later when user/Role permission management is implemented, we will remove that and switch to backend based permission management.
  hasUIPermission(permissionName: string): boolean {
    return this.uiPermissions.includes(permissionName);
  }

  // TODO: Later when user/Role permission management is implemented, we will remove that and switch to backend based permission management.
  private loadUiPermissionsForCurrentUser(): string[] {
    const currentUser = this.authService.getCurrentUser();
    const currentUserRole = replaceTextWithSeparator(
      currentUser?.designation ?? '',
      ' ',
      '_'
    ).toLowerCase();

    const uiPermissions: string[] = [];

    (
      Object.keys(
        FEATURE_VISIBILITY_CONFIG
      ) as (keyof typeof FEATURE_VISIBILITY_CONFIG)[]
    ).forEach(moduleKey => {
      const moduleConfig = FEATURE_VISIBILITY_CONFIG[moduleKey];

      Object.keys(moduleConfig).forEach(fieldKey => {
        const fieldConfig = moduleConfig[
          fieldKey as keyof typeof moduleConfig
        ] as Record<string, boolean> | undefined;

        if (!fieldConfig) {
          return;
        }

        if (
          currentUserRole &&
          fieldConfig[currentUserRole] !== undefined &&
          fieldConfig[currentUserRole]
        ) {
          uiPermissions.push(`${String(moduleKey)}.${String(fieldKey)}`);
        }
      });
    });
    return uiPermissions;
  }
}
