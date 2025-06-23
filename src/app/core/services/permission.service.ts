import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, BehaviorSubject, map, catchError, of, delay } from 'rxjs';
import { LoggerService } from './logger.service';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  directPermissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface PermissionAssignment {
  targetType: 'role' | 'user';
  targetId: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly logger = inject(LoggerService);

  // Signal-based reactive state
  private readonly _permissions = signal<Permission[]>([]);
  private readonly _roles = signal<Role[]>([]);
  private readonly _users = signal<User[]>([]);
  private readonly _modules = signal<Module[]>([]);
  private readonly _loading = signal<boolean>(false);

  // Computed signals
  readonly permissions = computed(() => this._permissions());
  readonly roles = computed(() => this._roles());
  readonly users = computed(() => this._users());
  readonly modules = computed(() => this._modules());
  readonly loading = computed(() => this._loading());

  // User permissions cache
  private userPermissionsSubject = new BehaviorSubject<string[]>([]);
  readonly userPermissions$ = this.userPermissionsSubject.asObservable();

  // Mock data
  private mockModules: Module[] = [
    {
      id: 'mod-1',
      name: 'User Management',
      description: 'Manage users, roles, and authentication',
      permissions: []
    },
    {
      id: 'mod-2',
      name: 'Employee Management',
      description: 'Manage employee records and profiles',
      permissions: []
    },
    {
      id: 'mod-3',
      name: 'Attendance Management',
      description: 'Track and manage employee attendance',
      permissions: []
    },
    {
      id: 'mod-4',
      name: 'Expense Management',
      description: 'Handle expense reports and reimbursements',
      permissions: []
    },
    {
      id: 'mod-5',
      name: 'Project Management',
      description: 'Manage projects and assignments',
      permissions: []
    },
    {
      id: 'mod-6',
      name: 'Asset Management',
      description: 'Track and manage company assets',
      permissions: []
    },
    {
      id: 'mod-7',
      name: 'Payroll Management',
      description: 'Handle payroll and salary processing',
      permissions: []
    },
    {
      id: 'mod-8',
      name: 'Reports & Analytics',
      description: 'Generate reports and view analytics',
      permissions: []
    },
    {
      id: 'mod-9',
      name: 'System Settings',
      description: 'Configure system settings and preferences',
      permissions: []
    },
    {
      id: 'mod-10',
      name: 'Security & Audit',
      description: 'Manage security settings and audit logs',
      permissions: []
    }
  ];

  private mockPermissions: Permission[] = [
    // User Management permissions
    { id: 'perm-1', name: 'View Users', description: 'Can view user listings and profiles', module: 'mod-1', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: 'perm-2', name: 'Create Users', description: 'Can create new user accounts', module: 'mod-1', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: 'perm-3', name: 'Edit Users', description: 'Can modify existing user information', module: 'mod-1', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: 'perm-4', name: 'Delete Users', description: 'Can delete user accounts', module: 'mod-1', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    
    // Employee Management permissions
    { id: 'perm-5', name: 'View Employees', description: 'Can view employee records', module: 'mod-2', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
    { id: 'perm-6', name: 'Add Employees', description: 'Can add new employee records', module: 'mod-2', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
    { id: 'perm-7', name: 'Update Employee Info', description: 'Can update employee information', module: 'mod-2', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
    
    // Attendance Management permissions
    { id: 'perm-8', name: 'View Attendance', description: 'Can view attendance records', module: 'mod-3', createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') },
    { id: 'perm-9', name: 'Mark Attendance', description: 'Can mark attendance for employees', module: 'mod-3', createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') },
    { id: 'perm-10', name: 'Generate Attendance Reports', description: 'Can generate attendance reports', module: 'mod-3', createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') },
    
    // Expense Management permissions
    { id: 'perm-11', name: 'View Expenses', description: 'Can view expense reports', module: 'mod-4', createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04') },
    { id: 'perm-12', name: 'Submit Expenses', description: 'Can submit expense claims', module: 'mod-4', createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04') },
    { id: 'perm-13', name: 'Approve Expenses', description: 'Can approve or reject expense claims', module: 'mod-4', createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04') },
    
    // Project Management permissions
    { id: 'perm-14', name: 'View Projects', description: 'Can view project listings', module: 'mod-5', createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-05') },
    { id: 'perm-15', name: 'Create Projects', description: 'Can create new projects', module: 'mod-5', createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-05') }
  ];

  private mockRoles: Role[] = [
    {
      id: 'role-1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: this.mockPermissions,
      isSystemRole: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'role-2',
      name: 'HR Manager',
      description: 'Human resources management with employee and attendance access',
      permissions: this.mockPermissions.filter(p => ['mod-2', 'mod-3'].includes(p.module)),
      isSystemRole: false,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    },
    {
      id: 'role-3',
      name: 'Project Manager',
      description: 'Project management with limited employee access',
      permissions: this.mockPermissions.filter(p => ['mod-5', 'mod-2'].includes(p.module)),
      isSystemRole: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    },
    {
      id: 'role-4',
      name: 'Finance Manager',
      description: 'Financial operations including expenses and payroll',
      permissions: this.mockPermissions.filter(p => ['mod-4', 'mod-7'].includes(p.module)),
      isSystemRole: false,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04')
    },
    {
      id: 'role-5',
      name: 'Employee',
      description: 'Basic employee access to personal information',
      permissions: this.mockPermissions.filter(p => ['perm-8', 'perm-12'].includes(p.id)),
      isSystemRole: false,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    }
  ];

  private mockUsers: User[] = [
    {
      id: 'user-1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: this.mockRoles[0], // Super Admin
      directPermissions: [],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'user-2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: this.mockRoles[1], // HR Manager
      directPermissions: [this.mockPermissions[13]], // Additional View Projects permission
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    },
    {
      id: 'user-3',
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      role: this.mockRoles[2], // Project Manager
      directPermissions: [this.mockPermissions[10]], // Additional View Expenses permission
      isActive: true,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    },
    {
      id: 'user-4',
      name: 'Lisa Chen',
      email: 'lisa.chen@company.com',
      role: this.mockRoles[3], // Finance Manager
      directPermissions: [],
      isActive: true,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04')
    },
    {
      id: 'user-5',
      name: 'Robert Wilson',
      email: 'robert.wilson@company.com',
      role: this.mockRoles[4], // Employee
      directPermissions: [],
      isActive: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    },
    {
      id: 'user-6',
      name: 'Emily Brown',
      email: 'emily.brown@company.com',
      role: this.mockRoles[4], // Employee
      directPermissions: [this.mockPermissions[4]], // Additional View Employees permission
      isActive: true,
      createdAt: new Date('2024-01-06'),
      updatedAt: new Date('2024-01-06')
    },
    {
      id: 'user-7',
      name: 'David Garcia',
      email: 'david.garcia@company.com',
      role: this.mockRoles[2], // Project Manager
      directPermissions: [],
      isActive: false,
      createdAt: new Date('2024-01-07'),
      updatedAt: new Date('2024-01-07')
    },
    {
      id: 'user-8',
      name: 'Jennifer Martinez',
      email: 'jennifer.martinez@company.com',
      role: this.mockRoles[1], // HR Manager
      directPermissions: [this.mockPermissions[14]], // Additional Create Projects permission
      isActive: true,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08')
    },
    {
      id: 'user-9',
      name: 'Kevin Lee',
      email: 'kevin.lee@company.com',
      role: this.mockRoles[4], // Employee
      directPermissions: [],
      isActive: true,
      createdAt: new Date('2024-01-09'),
      updatedAt: new Date('2024-01-09')
    },
    {
      id: 'user-10',
      name: 'Amanda Taylor',
      email: 'amanda.taylor@company.com',
      role: this.mockRoles[3], // Finance Manager
      directPermissions: [this.mockPermissions[1]], // Additional Create Users permission
      isActive: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: 'user-11',
      name: 'Christopher White',
      email: 'christopher.white@company.com',
      role: this.mockRoles[4], // Employee
      directPermissions: [],
      isActive: true,
      createdAt: new Date('2024-01-11'),
      updatedAt: new Date('2024-01-11')
    },
    {
      id: 'user-12',
      name: 'Michelle Anderson',
      email: 'michelle.anderson@company.com',
      role: this.mockRoles[1], // HR Manager
      directPermissions: [],
      isActive: false,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12')
    }
  ];

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    this.loadPermissions();
    this.loadRoles();
    this.loadUsers();
    this.loadModules();
  }

  // Permission CRUD operations with mock data
  loadPermissions(): void {
    this._loading.set(true);
    
    // Simulate API delay
    of(this.mockPermissions).pipe(
      delay(500)
    ).subscribe({
      next: (permissions) => {
        this._permissions.set(permissions);
        this.logger.info('Mock permissions loaded successfully', { count: permissions.length });
      },
      error: (error) => {
        this.logger.error('Failed to load permissions', error);
        this._permissions.set([]);
      },
      complete: () => this._loading.set(false)
    });
  }

  createPermission(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Observable<Permission> {
    const newPermission: Permission = {
      ...permission,
      id: `perm-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(newPermission).pipe(
      delay(300),
      map(createdPermission => {
        const currentPermissions = this._permissions();
        this._permissions.set([...currentPermissions, createdPermission]);
        this.mockPermissions.push(createdPermission);
        this.logger.info('Mock permission created successfully', createdPermission);
        return createdPermission;
      }),
      catchError(error => {
        this.logger.error('Failed to create permission', error);
        throw error;
      })
    );
  }

  updatePermission(id: string, permission: Partial<Permission>): Observable<Permission> {
    const currentPermissions = this._permissions();
    const index = currentPermissions.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Permission not found');
    }

    const updatedPermission: Permission = {
      ...currentPermissions[index],
      ...permission,
      updatedAt: new Date()
    };

    return of(updatedPermission).pipe(
      delay(300),
      map(updated => {
        const newPermissions = [...currentPermissions];
        newPermissions[index] = updated;
        this._permissions.set(newPermissions);
        
        // Update mock data
        const mockIndex = this.mockPermissions.findIndex(p => p.id === id);
        if (mockIndex > -1) {
          this.mockPermissions[mockIndex] = updated;
        }
        
        this.logger.info('Mock permission updated successfully', updated);
        return updated;
      }),
      catchError(error => {
        this.logger.error('Failed to update permission', error);
        throw error;
      })
    );
  }

  deletePermission(id: string): Observable<void> {
    return of(void 0).pipe(
      delay(300),
      map(() => {
        const currentPermissions = this._permissions();
        this._permissions.set(currentPermissions.filter(p => p.id !== id));
        
        // Update mock data
        const mockIndex = this.mockPermissions.findIndex(p => p.id === id);
        if (mockIndex > -1) {
          this.mockPermissions.splice(mockIndex, 1);
        }
        
        this.logger.info('Mock permission deleted successfully', { id });
      }),
      catchError(error => {
        this.logger.error('Failed to delete permission', error);
        throw error;
      })
    );
  }

  // Role CRUD operations with mock data
  loadRoles(): void {
    this._loading.set(true);
    
    of(this.mockRoles).pipe(
      delay(500)
    ).subscribe({
      next: (roles) => {
        this._roles.set(roles);
        this.logger.info('Mock roles loaded successfully', { count: roles.length });
      },
      error: (error) => {
        this.logger.error('Failed to load roles', error);
        this._roles.set([]);
      },
      complete: () => this._loading.set(false)
    });
  }

  createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Observable<Role> {
    const newRole: Role = {
      ...role,
      id: `role-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(newRole).pipe(
      delay(300),
      map(createdRole => {
        const currentRoles = this._roles();
        this._roles.set([...currentRoles, createdRole]);
        this.mockRoles.push(createdRole);
        this.logger.info('Mock role created successfully', createdRole);
        return createdRole;
      }),
      catchError(error => {
        this.logger.error('Failed to create role', error);
        throw error;
      })
    );
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    const currentRoles = this._roles();
    const index = currentRoles.findIndex(r => r.id === id);
    
    if (index === -1) {
      throw new Error('Role not found');
    }

    const updatedRole: Role = {
      ...currentRoles[index],
      ...role,
      updatedAt: new Date()
    };

    return of(updatedRole).pipe(
      delay(300),
      map(updated => {
        const newRoles = [...currentRoles];
        newRoles[index] = updated;
        this._roles.set(newRoles);
        
        // Update mock data
        const mockIndex = this.mockRoles.findIndex(r => r.id === id);
        if (mockIndex > -1) {
          this.mockRoles[mockIndex] = updated;
        }
        
        this.logger.info('Mock role updated successfully', updated);
        return updated;
      }),
      catchError(error => {
        this.logger.error('Failed to update role', error);
        throw error;
      })
    );
  }

  // User operations with mock data
  loadUsers(): void {
    this._loading.set(true);
    
    of(this.mockUsers).pipe(
      delay(500)
    ).subscribe({
      next: (users) => {
        this._users.set(users);
        this.logger.info('Mock users loaded successfully', { count: users.length });
      },
      error: (error) => {
        this.logger.error('Failed to load users', error);
        this._users.set([]);
      },
      complete: () => this._loading.set(false)
    });
  }

  // Module operations with mock data
  loadModules(): void {
    this._loading.set(true);
    
    // Associate permissions with modules
    const modulesWithPermissions = this.mockModules.map(module => ({
      ...module,
      permissions: this.mockPermissions.filter(p => p.module === module.id)
    }));

    of(modulesWithPermissions).pipe(
      delay(500)
    ).subscribe({
      next: (modules) => {
        this._modules.set(modules);
        this.logger.info('Mock modules loaded successfully', { count: modules.length });
      },
      error: (error) => {
        this.logger.error('Failed to load modules', error);
        this._modules.set([]);
      },
      complete: () => this._loading.set(false)
    });
  }

  // Permission assignment operations with mock data
  assignPermissionsToRole(roleId: string, permissionIds: string[]): Observable<Role> {
    const assignment: PermissionAssignment = {
      targetType: 'role',
      targetId: roleId,
      permissions: permissionIds
    };

    const selectedPermissions = this.mockPermissions.filter(p => permissionIds.includes(p.id));

    return of(assignment).pipe(
      delay(500),
      map(() => {
        // Find and update the role in both signals and mock data
        const currentRoles = this._roles();
        const roleIndex = currentRoles.findIndex(r => r.id === roleId);
        
        if (roleIndex === -1) {
          throw new Error('Role not found');
        }

        const updatedRole: Role = {
          ...currentRoles[roleIndex],
          permissions: selectedPermissions,
          updatedAt: new Date()
        };

        const newRoles = [...currentRoles];
        newRoles[roleIndex] = updatedRole;
        this._roles.set(newRoles);

        // Update mock data
        const mockRoleIndex = this.mockRoles.findIndex(r => r.id === roleId);
        if (mockRoleIndex > -1) {
          this.mockRoles[mockRoleIndex] = updatedRole;
        }

        this.logger.info('Mock permissions assigned to role successfully', { roleId, permissionIds });
        return updatedRole;
      }),
      catchError(error => {
        this.logger.error('Failed to assign permissions to role', error);
        throw error;
      })
    );
  }

  assignPermissionsToUser(userId: string, permissionIds: string[]): Observable<User> {
    const assignment: PermissionAssignment = {
      targetType: 'user',
      targetId: userId,
      permissions: permissionIds
    };

    const selectedPermissions = this.mockPermissions.filter(p => permissionIds.includes(p.id));

    return of(assignment).pipe(
      delay(500),
      map(() => {
        // Find and update the user in both signals and mock data
        const currentUsers = this._users();
        const userIndex = currentUsers.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          throw new Error('User not found');
        }

        const updatedUser: User = {
          ...currentUsers[userIndex],
          directPermissions: selectedPermissions,
          updatedAt: new Date()
        };

        const newUsers = [...currentUsers];
        newUsers[userIndex] = updatedUser;
        this._users.set(newUsers);

        // Update mock data
        const mockUserIndex = this.mockUsers.findIndex(u => u.id === userId);
        if (mockUserIndex > -1) {
          this.mockUsers[mockUserIndex] = updatedUser;
        }

        this.logger.info('Mock permissions assigned to user successfully', { userId, permissionIds });
        return updatedUser;
      }),
      catchError(error => {
        this.logger.error('Failed to assign permissions to user', error);
        throw error;
      })
    );
  }

  // Permission checking
  hasPermission(permission: string): boolean {
    const userPermissions = this.userPermissionsSubject.value;
    return userPermissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  loadUserPermissions(userId: string): void {
    // Mock user permissions loading
    const user = this.mockUsers.find(u => u.id === userId);
    if (user) {
      const rolePermissions = user.role?.permissions?.map(p => p.id) || [];
      const directPermissions = user.directPermissions?.map(p => p.id) || [];
      const allPermissions = [...new Set([...rolePermissions, ...directPermissions])];
      
      this.userPermissionsSubject.next(allPermissions);
      this.logger.info('Mock user permissions loaded', { userId, permissions: allPermissions });
    } else {
      this.userPermissionsSubject.next([]);
      this.logger.warn('User not found for permission loading', { userId });
    }
  }

  // Helper methods
  getPermissionsByModule(moduleId: string): Permission[] {
    return this.mockPermissions.filter(permission => permission.module === moduleId);
  }

  getUserEffectivePermissions(userId: string): Permission[] {
    const user = this.mockUsers.find(u => u.id === userId);
    if (!user) return [];

    const rolePermissions = user.role?.permissions || [];
    const directPermissions = user.directPermissions || [];
    
    // Combine and deduplicate permissions
    const allPermissions = [...rolePermissions, ...directPermissions];
    const uniquePermissions = allPermissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );

    return uniquePermissions;
  }

  getRolePermissions(roleId: string): Permission[] {
    const role = this.mockRoles.find(r => r.id === roleId);
    return role?.permissions || [];
  }
} 