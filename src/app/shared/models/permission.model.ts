import { PERMISSIONS } from '../../core/constants/permission.constants';

/**
 * Type representing a permission string from the PERMISSIONS constant
 */
export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]];

/**
 * Interface for role-based permissions
 */
export interface RolePermissions {
  role: string;
  permissions: PermissionType[];
} 