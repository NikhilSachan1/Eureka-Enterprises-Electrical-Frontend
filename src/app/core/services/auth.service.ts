import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  login() {
    // Simulate user login response from backend
    const userData = {
      userId: "123",
      role: "admin",
      // Using strings for backward compatibility, but in new code we should use the typed permissions
      permissions: ["READ_DASHBOARD", "MANAGE_USERS", "EDIT_SETTINGS"]
    };
  }
}
