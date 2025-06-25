import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { MetricsCardComponent } from '../../../shared/components/metrics-card/metrics-card.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

import { PermissionService, Permission, Role, User } from '../../../core/services/permission.service';
import { DataTableConfigService } from '../../../shared/services/data-table-config.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog-config.service';
import { LoggerService } from '../../../core/services/logger.service';

import { IDataTableHeaderConfig } from '../../../shared/models';
import { EBulkActionType, ETableBodyTemplate, EDialogType } from '../../../shared/types';
import { ROUTE_BASE_PATHS, ROUTES } from '../../../shared/constants';
import { PERMISSION_LIST_TABLE_CONFIG, PERMISSION_LIST_TABLE_HEADER, PERMISSION_LIST_BULK_ACTIONS_CONFIG, PERMISSION_LIST_ROW_ACTIONS_CONFIG } from '../config/table/permission-list-table.config';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TabViewModule,
    CardModule,
    PageHeaderComponent,
    DataTableComponent,
    MetricsCardComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.scss']
})
export class PermissionListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);
  private readonly dataTableConfigService = inject(DataTableConfigService);
  private readonly confirmationDialogConfigService = inject(ConfirmationDialogService);
  private readonly logger = inject(LoggerService);

  // Signal-based reactive state
  private readonly _activeTabIndex = signal<number>(0);
  private readonly _selectedPermissions = signal<Permission[]>([]);
  private readonly _selectedRoles = signal<Role[]>([]);
  private readonly _selectedUsers = signal<User[]>([]);

  // Computed properties
  readonly activeTabIndex = computed(() => this._activeTabIndex());
  readonly loading = computed(() => this.permissionService.loading());
  readonly permissions = computed(() => this.permissionService.permissions());
  readonly roles = computed(() => this.permissionService.roles());
  readonly users = computed(() => this.permissionService.users());
  readonly modules = computed(() => this.permissionService.modules());

  // Table configurations
  readonly permissionTableConfig = computed(() => 
    this.dataTableConfigService.getTableConfig(PERMISSION_LIST_TABLE_CONFIG)
  );
  readonly permissionTableHeader = computed(() => 
    this.dataTableConfigService.getTableHeaderConfig(PERMISSION_LIST_TABLE_HEADER)
  );
  readonly permissionBulkActions = computed(() => 
    this.dataTableConfigService.getBulkActionsConfig(PERMISSION_LIST_BULK_ACTIONS_CONFIG)
  );
  readonly permissionRowActions = computed(() => 
    this.dataTableConfigService.getRowActionsConfig(PERMISSION_LIST_ROW_ACTIONS_CONFIG)
  );

  // Role table configurations
  readonly roleTableConfig = computed(() => 
    this.dataTableConfigService.getTableConfig({
      ...PERMISSION_LIST_TABLE_CONFIG,
      globalFilterFields: ['name', 'description']
    })
  );

  readonly roleTableHeader = computed<IDataTableHeaderConfig[]>(() => [
    {
      field: 'name',
      header: 'Role Name',
      showFilter: true,
      showSort: true,
      filterConfig: {
        filterField: 'name',
        placeholder: 'Search Role Name',
      },
    },
    {
      field: 'description',
      header: 'Description',
      showFilter: true,
      showSort: true,
      filterConfig: {
        filterField: 'description',
        placeholder: 'Search Description',
      },
    },
    {
      field: 'permissions',
      header: 'Permissions Count',
      showFilter: false,
      showSort: true,
    },
    {
      field: 'isSystemRole',
      header: 'System Role',
      bodyTemplate: ETableBodyTemplate.STATUS,
      showFilter: true,
      showSort: true,
    }
  ]);

  // User table configurations
  readonly userTableConfig = computed(() => 
    this.dataTableConfigService.getTableConfig({
      ...PERMISSION_LIST_TABLE_CONFIG,
      globalFilterFields: ['name', 'email', 'role.name']
    })
  );

  readonly userTableHeader = computed<IDataTableHeaderConfig[]>(() => [
    {
      field: 'name',
      header: 'User Name',
      bodyTemplate: ETableBodyTemplate.TEXT_WITH_SUBTITLE_AND_IMAGE,
      showFilter: true,
      showSort: true,
      textWithSubtitleAndImageConfig: {
        showImage: true,
        dummyImageField: 'name',
        secondaryField: 'email',
        secondaryFieldLabel: 'Email'
      },
      filterConfig: {
        filterField: 'name',
        placeholder: 'Search User Name',
      },
    },
    {
      field: 'role.name',
      header: 'Role',
      showFilter: true,
      showSort: true,
      filterConfig: {
        filterField: 'role.name',
        placeholder: 'Search Role',
      },
    },
    {
      field: 'directPermissions',
      header: 'Direct Permissions',
      showFilter: false,
      showSort: true,
    },
    {
      field: 'isActive',
      header: 'Status',
      bodyTemplate: ETableBodyTemplate.STATUS,
      showFilter: true,
      showSort: true,
    }
  ]);

  // Metrics cards
  readonly metricsCards = computed(() => [
    {
      title: 'Total Permissions',
      subtitle: 'System-wide permissions',
      iconClass: 'pi pi-shield',
      iconBgClass: 'bg-blue-100 text-blue-600',
      metrics: [
        {
          label: 'Active',
          value: this.permissions().length.toString(),
          trend: '+12%',
          trendDirection: 'up' as const,
          trendColor: 'text-green-600'
        }
      ]
    },
    {
      title: 'Total Roles',
      subtitle: 'Available roles',
      iconClass: 'pi pi-users',
      iconBgClass: 'bg-green-100 text-green-600',
      metrics: [
        {
          label: 'Roles',
          value: this.roles().length.toString(),
          trend: '+3%',
          trendDirection: 'up' as const,
          trendColor: 'text-green-600'
        }
      ]
    },
    {
      title: 'Active Users',
      subtitle: 'Users with permissions',
      iconClass: 'pi pi-user',
      iconBgClass: 'bg-purple-100 text-purple-600',
      metrics: [
        {
          label: 'Users',
          value: this.users().filter(u => u.isActive).length.toString(),
          trend: '+8%',
          trendDirection: 'up' as const,
          trendColor: 'text-green-600'
        }
      ]
    },
    {
      title: 'Modules',
      subtitle: 'Permission modules',
      iconClass: 'pi pi-th-large',
      iconBgClass: 'bg-orange-100 text-orange-600',
      metrics: [
        {
          label: 'Active',
          value: this.modules().length.toString(),
          trend: '0%',
          trendDirection: 'neutral' as const,
          trendColor: 'text-gray-600'
        }
      ]
    }
  ]);

  ngOnInit(): void {
    this.logger.info('Permission List Component initialized');
  }

  onTabChange(event: any): void {
    this._activeTabIndex.set(event.index);
    this.logger.info('Tab changed', { activeTab: event.index });
  }

  onAddPermission(): void {
    this.router.navigate([`/${ROUTE_BASE_PATHS.PERMISSION}/${ROUTES.PERMISSION.ADD}`]);
  }

  onManagePermissions(): void {
    this.router.navigate([`/${ROUTE_BASE_PATHS.PERMISSION}/${ROUTES.PERMISSION.MANAGE}`]);
  }

  // Permission table handlers
  handlePermissionBulkAction(actionId: string): void {
    const selectedPermissions = this._selectedPermissions();
    
    switch (actionId) {
      case EBulkActionType.DELETE:
        this.handleBulkDeletePermissions(selectedPermissions);
        break;
      default:
        this.logger.warn('Unknown bulk action', { actionId });
    }
  }

  handlePermissionRowAction(actionId: string): void {
    // Implementation for row actions would go here
    this.logger.info('Permission row action', { actionId });
  }

  // Role table handlers
  handleRoleBulkAction(actionId: string): void {
    const selectedRoles = this._selectedRoles();
    
    switch (actionId) {
      case EBulkActionType.DELETE:
        this.handleBulkDeleteRoles(selectedRoles);
        break;
      default:
        this.logger.warn('Unknown bulk action', { actionId });
    }
  }

  handleRoleRowAction(actionId: string): void {
    this.logger.info('Role row action', { actionId });
  }

  // User table handlers
  handleUserBulkAction(actionId: string): void {
    const selectedUsers = this._selectedUsers();
    this.logger.info('User bulk action', { actionId, selectedUsers });
  }

  handleUserRowAction(actionId: string): void {
    this.logger.info('User row action', { actionId });
  }

  private handleBulkDeletePermissions(permissions: Permission[]): void {
    this.confirmationDialogConfigService.showDialog(
      EDialogType.DELETE,
      {
        header: 'Delete Permissions',
        message: `Are you sure you want to delete ${permissions.length} permission(s)? This action cannot be undone.`
      },
      () => {
        // Handle deletion logic here
        this.logger.info('Bulk delete permissions confirmed', { permissions });
      }
    );
  }

  private handleBulkDeleteRoles(roles: Role[]): void {
    this.confirmationDialogConfigService.showDialog(
      EDialogType.DELETE,
      {
        header: 'Delete Roles',
        message: `Are you sure you want to delete ${roles.length} role(s)? This action cannot be undone.`
      },
      () => {
        // Handle deletion logic here
        this.logger.info('Bulk delete roles confirmed', { roles });
      }
    );
  }

  // Transform data for tables
  readonly permissionTableData = computed(() => 
    this.permissions().map(permission => ({
      ...permission,
      moduleName: this.modules().find(m => m.id === permission.module)?.name || 'Unknown'
    }))
  );

  readonly roleTableData = computed(() => 
    this.roles().map(role => ({
      ...role,
      permissions: role.permissions.length,
      isSystemRole: role.isSystemRole ? 'System' : 'Custom'
    }))
  );

  readonly userTableData = computed(() => 
    this.users().map(user => ({
      ...user,
      directPermissions: user.directPermissions.length,
      isActive: user.isActive ? 'Active' : 'Inactive'
    }))
  );
} 