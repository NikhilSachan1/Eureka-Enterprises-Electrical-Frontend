import { Injectable, signal } from '@angular/core';
import { IAppPermission } from '@features/settings-management/permission-management/sub-features/user-permission-management/types/user-permission.interface';

@Injectable({
  providedIn: 'root',
})
export class AppPermissionService {
  private readonly _permissions = signal<IAppPermission>([]);

  getPermissions(): IAppPermission {
    return this._permissions();
  }

  setPermissions(permissions: IAppPermission): void {
    this._permissions.set(permissions);
  }

  hasPermission(permissionName: string): boolean {
    return this._permissions().includes(permissionName);
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
