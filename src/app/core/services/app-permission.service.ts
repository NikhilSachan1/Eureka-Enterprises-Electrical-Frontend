import { Injectable } from '@angular/core';
import { IAppPermission } from '@features/settings-management/permission-management/sub-features/user-permission-management/types/user-permission.interface';

@Injectable({
  providedIn: 'root',
})
export class AppPermissionService {
  private permissions: IAppPermission = [];

  setPermissions(permissions: IAppPermission): void {
    this.permissions = permissions;
  }

  hasPermission(permissionName: string): boolean {
    return this.permissions.includes(permissionName);
  }
}
