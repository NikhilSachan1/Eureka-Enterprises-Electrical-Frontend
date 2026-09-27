import { Injectable, signal } from '@angular/core';
import { IAppPermission } from '@features/settings-management/permission-management/sub-features/user-permission-management/types/user-permission.interface';

@Injectable({
  providedIn: 'root',
})
export class AppPermissionService {
  private readonly _permissions = signal<IAppPermission>([]);
  /** Site-vendor menu gating from GET /sites/vendors/assignable. Fail closed until loaded. */
  private readonly _vendorMenuAllowed = signal(false);
  /** Employee-only: Assign Vendor is limited to `sites[]` from the assignable API. */
  private readonly _vendorAssignGated = signal(false);
  private readonly _assignableVendorSiteIds = signal<ReadonlySet<string>>(
    new Set()
  );

  getPermissions(): IAppPermission {
    return this._permissions();
  }

  setPermissions(permissions: IAppPermission): void {
    this._permissions.set(permissions);
  }

  isVendorMenuAllowed(): boolean {
    return this._vendorMenuAllowed();
  }

  setAssignableVendorAccess(options: {
    gated: boolean;
    allowed: boolean;
    siteIds?: readonly string[];
  }): void {
    this._vendorAssignGated.set(options.gated);
    this._vendorMenuAllowed.set(options.allowed);
    this._assignableVendorSiteIds.set(new Set(options.siteIds ?? []));
  }

  setVendorMenuAllowed(allowed: boolean): void {
    this._vendorMenuAllowed.set(allowed);
  }

  isVendorAssignmentDisabledForSite(
    siteId: string | null | undefined
  ): boolean {
    if (!this._vendorAssignGated()) {
      return false;
    }

    if (!this._vendorMenuAllowed() || !siteId) {
      return true;
    }

    return !this._assignableVendorSiteIds().has(siteId);
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
