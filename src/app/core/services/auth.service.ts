import { inject, Injectable } from '@angular/core';
import { PermissionService } from './permission.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly permissionService = inject(PermissionService);

  login() {
    const userData = {
      "userId": "123",
      "role": "admin",
      "permissions": ["READ_DASHBOARD", "MANAGE_USERS", "EDIT_SETTINGS"]
    };
    const { permissions } = userData;
    this.permissionService.setPermissions(permissions);
  }
}
