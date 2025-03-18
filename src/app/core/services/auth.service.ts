import { inject, Injectable } from '@angular/core';
import { PermissionService } from './permission.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly permissionService = inject(PermissionService);

  login() {
    // Simulate user login response from backend
    const userData = {
      userId: "123",
      role: "admin",
      // Using strings for backward compatibility, but in new code we should use the typed permissions
      permissions: ["READ_DASHBOARD", "MANAGE_USERS", "EDIT_SETTINGS"]
    };
    
    // Setting string-based permissions for backward compatibility
    const { permissions } = userData;
    this.permissionService.setPermissions(permissions);
    
    // A better approach would be to use the role-based permission system:
    this.permissionService.setUserRole(userData.role);

    // Or set predefined permission sets based on business logic
    // Example: if (userData.isAdmin) this.permissionService.setUserRole('admin');
  }

  logout() {
    // Clear permissions on logout
    this.permissionService.setPermissions([]);
  }
}
