import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { TabViewModule } from 'primeng/tabview';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PermissionService, Permission, Role, User, Module } from '../../../core/services/permission.service';
import { LoggerService } from '../../../core/services/logger.service';
import { ICONS } from '../../../shared/constants';

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    SelectModule,
    TabViewModule,
    TreeModule,
    ToastModule,
    PageHeaderComponent
  ],
  templateUrl: './permission-management.component.html',
  styleUrls: ['./permission-management.component.scss'],
  providers: [MessageService]
})
export class PermissionManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly permissionService = inject(PermissionService);
  private readonly logger = inject(LoggerService);
  private readonly messageService = inject(MessageService);
  
  protected readonly icons = ICONS;

  // Form groups
  rolePermissionForm: FormGroup;
  userPermissionForm: FormGroup;

  // Signal-based reactive state
  private readonly _activeTabIndex = signal<number>(0);
  private readonly _selectedRole = signal<Role | null>(null);
  private readonly _selectedUser = signal<User | null>(null);
  private readonly _saving = signal<boolean>(false);

  // Computed properties
  readonly activeTabIndex = computed(() => this._activeTabIndex());
  readonly selectedRole = computed(() => this._selectedRole());
  readonly selectedUser = computed(() => this._selectedUser());
  readonly saving = computed(() => this._saving());
  readonly loading = computed(() => this.permissionService.loading());

  readonly permissions = computed(() => this.permissionService.permissions());
  readonly roles = computed(() => this.permissionService.roles());
  readonly users = computed(() => this.permissionService.users());
  readonly modules = computed(() => this.permissionService.modules());

  // Options for dropdowns
  readonly roleOptions = computed(() => 
    this.roles().map(role => ({
      label: role.name,
      value: role
    }))
  );

  readonly userOptions = computed(() => 
    this.users().map(user => ({
      label: `${user.name} (${user.email})`,
      value: user
    }))
  );

  // Permission tree structure
  readonly permissionTree = computed(() => this.buildPermissionTree());

  // Selected permissions for role
  readonly roleSelectedPermissions = computed(() => {
    const role = this.selectedRole();
    if (!role) return [];
    return role.permissions.map(p => p.id);
  });

  // Selected permissions for user (role + direct)
  readonly userSelectedPermissions = computed(() => {
    const user = this.selectedUser();
    if (!user) return [];
    
    const rolePermissions = user.role?.permissions || [];
    const directPermissions = user.directPermissions || [];
    const allPermissions = [...rolePermissions, ...directPermissions];
    
    return allPermissions.map(p => p.id);
  });

  // Direct permissions for user (excluding role permissions)
  readonly userDirectPermissions = computed(() => {
    const user = this.selectedUser();
    if (!user) return [];
    return user.directPermissions.map(p => p.id);
  });

  constructor() {
    this.rolePermissionForm = this.fb.group({
      selectedRole: [null, Validators.required],
      permissions: [[]]
    });

    this.userPermissionForm = this.fb.group({
      selectedUser: [null, Validators.required],
      permissions: [[]]
    });
  }

  ngOnInit(): void {
    this.logger.info('Permission Management Component initialized');
    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions(): void {
    // Role selection subscription
    this.rolePermissionForm.get('selectedRole')?.valueChanges.subscribe(role => {
      this._selectedRole.set(role);
      if (role) {
        const permissionIds = role.permissions.map((p: Permission) => p.id);
        this.rolePermissionForm.patchValue({ permissions: permissionIds });
      }
    });

    // User selection subscription
    this.userPermissionForm.get('selectedUser')?.valueChanges.subscribe(user => {
      this._selectedUser.set(user);
      if (user) {
        const directPermissionIds = user.directPermissions.map((p: Permission) => p.id);
        this.userPermissionForm.patchValue({ permissions: directPermissionIds });
      }
    });
  }

  private buildPermissionTree(): TreeNode[] {
    const modules = this.modules();
    const permissions = this.permissions();

    return modules.map(module => ({
      label: module.name,
      data: module,
      key: module.id,
      expanded: true,
      children: permissions
        .filter(permission => permission.module === module.id)
        .map(permission => ({
          label: permission.name,
          data: permission,
          key: permission.id,
          leaf: true,
          type: 'permission'
        }))
    }));
  }

  onTabChange(event: any): void {
    this._activeTabIndex.set(event.index);
    this.logger.info('Tab changed', { activeTab: event.index });
  }

  onPermissionNodeSelect(event: any, formType: 'role' | 'user'): void {
    const selectedKeys = Object.keys(event);
    const permissionIds = selectedKeys.filter(key => {
      const permission = this.permissions().find(p => p.id === key);
      return permission; // Only include actual permissions, not modules
    });

    if (formType === 'role') {
      this.rolePermissionForm.patchValue({ permissions: permissionIds });
    } else {
      this.userPermissionForm.patchValue({ permissions: permissionIds });
    }
  }

  onRolePermissionSave(): void {
    if (this.rolePermissionForm.invalid) {
      this.markFormGroupTouched(this.rolePermissionForm);
      return;
    }

    const formData = this.rolePermissionForm.value;
    const role = formData.selectedRole;
    const permissionIds = formData.permissions;

    this._saving.set(true);
    this.permissionService.assignPermissionsToRole(role.id, permissionIds).subscribe({
      next: (updatedRole) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Permissions updated for role: ${updatedRole.name}`
        });
        this._selectedRole.set(updatedRole);
        this.logger.info('Role permissions updated successfully', { roleId: role.id });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update role permissions'
        });
        this.logger.error('Failed to update role permissions', error);
      },
      complete: () => this._saving.set(false)
    });
  }

  onUserPermissionSave(): void {
    if (this.userPermissionForm.invalid) {
      this.markFormGroupTouched(this.userPermissionForm);
      return;
    }

    const formData = this.userPermissionForm.value;
    const user = formData.selectedUser;
    const permissionIds = formData.permissions;

    this._saving.set(true);
    this.permissionService.assignPermissionsToUser(user.id, permissionIds).subscribe({
      next: (updatedUser) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Permissions updated for user: ${updatedUser.name}`
        });
        this._selectedUser.set(updatedUser);
        this.logger.info('User permissions updated successfully', { userId: user.id });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update user permissions'
        });
        this.logger.error('Failed to update user permissions', error);
      },
      complete: () => this._saving.set(false)
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Permission selection helpers
  isPermissionSelected(permissionId: string, type: 'role' | 'user'): boolean {
    if (type === 'role') {
      return this.roleSelectedPermissions().includes(permissionId);
    } else {
      return this.userDirectPermissions().includes(permissionId);
    }
  }

  isPermissionInherited(permissionId: string): boolean {
    const user = this.selectedUser();
    if (!user?.role) return false;
    
    const rolePermissionIds = user.role.permissions.map(p => p.id);
    return rolePermissionIds.includes(permissionId);
  }

  togglePermission(permissionId: string, type: 'role' | 'user'): void {
    const form = type === 'role' ? this.rolePermissionForm : this.userPermissionForm;
    const currentPermissions = form.get('permissions')?.value || [];
    
    const index = currentPermissions.indexOf(permissionId);
    let newPermissions;
    
    if (index > -1) {
      // Remove permission
      newPermissions = currentPermissions.filter((id: string) => id !== permissionId);
    } else {
      // Add permission
      newPermissions = [...currentPermissions, permissionId];
    }
    
    form.patchValue({ permissions: newPermissions });
  }

  toggleModulePermissions(moduleId: string, type: 'role' | 'user'): void {
    const modulePermissions = this.permissions().filter(p => p.module === moduleId);
    const form = type === 'role' ? this.rolePermissionForm : this.userPermissionForm;
    const currentPermissions = form.get('permissions')?.value || [];
    
    // Check if all module permissions are selected
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => currentPermissions.includes(id));
    
    let newPermissions;
    if (allSelected) {
      // Remove all module permissions
      newPermissions = currentPermissions.filter((id: string) => !modulePermissionIds.includes(id));
    } else {
      // Add all module permissions
      const permissionsToAdd = modulePermissionIds.filter(id => !currentPermissions.includes(id));
      newPermissions = [...currentPermissions, ...permissionsToAdd];
    }
    
    form.patchValue({ permissions: newPermissions });
  }

  isModuleFullySelected(moduleId: string, type: 'role' | 'user'): boolean {
    const modulePermissions = this.permissions().filter(p => p.module === moduleId);
    const selectedPermissions = type === 'role' 
      ? this.roleSelectedPermissions() 
      : this.userDirectPermissions();
    
    return modulePermissions.length > 0 && 
           modulePermissions.every(p => selectedPermissions.includes(p.id));
  }

  isModulePartiallySelected(moduleId: string, type: 'role' | 'user'): boolean {
    const modulePermissions = this.permissions().filter(p => p.module === moduleId);
    const selectedPermissions = type === 'role' 
      ? this.roleSelectedPermissions() 
      : this.userDirectPermissions();
    
    const someSelected = modulePermissions.some(p => selectedPermissions.includes(p.id));
    const allSelected = modulePermissions.every(p => selectedPermissions.includes(p.id));
    
    return someSelected && !allSelected;
  }
} 