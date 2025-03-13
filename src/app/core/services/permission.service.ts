import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private userPermissions = signal<Set<string>>(new Set());

  setPermissions(permissions: string[]) {
    this.userPermissions.set(new Set(permissions));
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions().has(permission);
  }

}
