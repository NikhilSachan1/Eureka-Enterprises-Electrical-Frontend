import { Injectable, signal } from '@angular/core';
import { PermissionType } from '../../shared/models';
import { PERMISSIONS } from '../constants/permission.constants';

/**
 * Sample role-based permissions map
 * In a real application, this would typically come from a backend API
 */
const ROLE_PERMISSIONS: Record<string, PermissionType[]> = {
  admin: [
    ...Object.values(PERMISSIONS.USERS),
    ...Object.values(PERMISSIONS.EXPENSES)
  ] as PermissionType[],
  manager: [
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.EXPENSES.VIEW,
    PERMISSIONS.EXPENSES.CREATE,
    PERMISSIONS.EXPENSES.UPDATE
  ],
  employee: [
    PERMISSIONS.USERS.VIEW,
    PERMISSIONS.EXPENSES.VIEW,
    PERMISSIONS.EXPENSES.CREATE
  ],
  guest: [
    PERMISSIONS.USERS.VIEW
  ]
};

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  // User's current role
  private readonly userRole = signal<string>('employee'); // Default role
  
  // User's permissions based on role
  private readonly userPermissions = signal<Set<PermissionType>>(new Set());

  constructor() {
    // Initialize permissions based on default role
    this.updatePermissions(this.userRole());
  }

  /**
   * Set user role and update permissions accordingly
   */
  setUserRole(role: string): void {
    this.userRole.set(role);
    this.updatePermissions(role);
  }

  /**
   * Get current user role
   */
  getUserRole(): string {
    return this.userRole();
  }

  /**
   * Set permissions directly (for backward compatibility)
   * @param permissions Array of permission strings
   */
  setPermissions(permissions: string[]): void {
    // Convert the string[] to PermissionType[] and handle potential type mismatches
    const validPermissions = permissions.filter(p => 
      Object.values(PERMISSIONS.USERS).includes(p as any) || 
      Object.values(PERMISSIONS.EXPENSES).includes(p as any)
    ) as PermissionType[];
    
    this.userPermissions.set(new Set(validPermissions));
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: PermissionType): boolean {
    return this.userPermissions().has(permission);
  }

  /**
   * Check if user has all specified permissions
   */
  hasPermissions(permissions: PermissionType[]): boolean {
    if (!permissions || permissions.length === 0) return true;
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Get all permissions for the current user
   */
  getAllPermissions(): PermissionType[] {
    return Array.from(this.userPermissions());
  }

  /**
   * Update permissions based on role
   */
  private updatePermissions(role: string): void {
    const permissions = ROLE_PERMISSIONS[role] || [];
    this.userPermissions.set(new Set(permissions));
  }
}
