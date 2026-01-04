import { inject, Injectable } from '@angular/core';
import { AuthService } from '@features/auth-management/services/auth.service';
import { IAppPermission } from '@features/settings-management/permission-management/sub-features/user-permission-management/types/user-permission.interface';

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

  hasAnyPermission(permissions: string[]): boolean {
    if (permissions.length === 0) {
      return true;
    }
    return permissions.some(p => this.hasPermission(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    if (permissions.length === 0) {
      return true;
    }
    return permissions.every(p => this.hasPermission(p));
  }

  filterByPermission<T extends { permission?: string[] }>(items: T[]): T[] {
    return items.filter(item => {
      if (!item.permission) {
        return true;
      }
      return this.hasAnyPermission(item.permission);
    });
  }

  filterRecordByPermission<T extends { permission?: string[] }>(
    config: Record<string, T>
  ): Record<string, T> {
    const filteredConfig: Record<string, T> = {};

    Object.entries(config).forEach(([key, value]) => {
      if (!value.permission) {
        filteredConfig[key] = value;
        return;
      }
      if (this.hasAnyPermission(value.permission)) {
        filteredConfig[key] = value;
      }
    });

    return filteredConfig;
  }
}
