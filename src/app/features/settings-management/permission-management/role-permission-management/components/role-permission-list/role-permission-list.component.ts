import { Component, OnInit, signal } from '@angular/core';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DataTableConfigService } from '../../../../../../shared/services/data-table-config.service';
import { ConfirmationDialogService } from '../../../../../../shared/services/confirmation-dialog-config.service';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../../../../shared/models';
import { ROLE_PERMISSION_LIST_BULK_ACTIONS_CONFIG, ROLE_PERMISSION_LIST_ROW_ACTIONS_CONFIG, ROLE_PERMISSION_LIST_TABLE_CONFIG, ROLE_PERMISSION_LIST_TABLE_HEADER } from '../../config/table/role-permission-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../../../../shared/types';

@Component({
  selector: 'app-role-permission-list',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './role-permission-list.component.html',
  styleUrl: './role-permission-list.component.scss'
})
export class RolePermissionListComponent implements OnInit {

  protected tableConfig = signal<IDataTableConfig>({} as IDataTableConfig);
  protected tableHeader = signal<IDataTableHeaderConfig[]>([]);
  protected tableData = signal<any[]>([]);
  protected loading = signal<boolean>(true);
  protected bulkActionButtons = signal<IBulkActionConfig[]>([]);
  protected rowActions = signal<IRowActionConfig[]>([]);

  constructor(
    private dataTableConfigService: DataTableConfigService,
    private confirmationDialogService: ConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.initializeTableConfig();
    this.getTableData();
  }

  private initializeTableConfig(): void {
    this.tableConfig.set(this.getTableConfig());
    this.tableHeader.set(this.getTableHeader());
    this.bulkActionButtons.set(this.getBulkActionButtons());
    this.rowActions.set(this.getRowActions());
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(ROLE_PERMISSION_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(ROLE_PERMISSION_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(ROLE_PERMISSION_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(ROLE_PERMISSION_LIST_ROW_ACTIONS_CONFIG);
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '1',
          name: 'Super Admin',
          description: 'Full system access with all permissions',
          level: 'Admin',
          status: 'Active'
        },
        {
          id: '2',
          name: 'Project Manager',
          description: 'Manage projects, sites, and team assignments',
          level: 'Manager',
          status: 'Active'
        },
        {
          id: '3',
          name: 'Site Supervisor',
          description: 'Oversee on-site operations and worker attendance',
          level: 'Supervisor',
          status: 'Active'
        },
        {
          id: '4',
          name: 'Field Worker',
          description: 'Basic access to attendance and expense management',
          level: 'Employee',
          status: 'Active'
        },
        {
          id: '5',
          name: 'HR Manager',
          description: 'Manage employee records and payroll processing',
          level: 'Manager',
          status: 'Inactive'
        },
        {
          id: '6',
          name: 'Finance Officer',
          description: 'Handle expense approvals and financial reporting',
          level: 'Manager',
          status: 'Active'
        }
      ]);
      this.loading.set(false);
    }, 1000);
  }

  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.APPROVE:
        console.log('Activate roles');
        break;
      case EBulkActionType.REJECT:
        console.log('Deactivate roles');
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.APPROVE:
        console.log('Activate role');
        break;
      case ERowActionType.REJECT:
        console.log('Deactivate role');
        break;
      case ERowActionType.EDIT:
        console.log('Edit role');
        break;
      case ERowActionType.VIEW:
        console.log('Edit permissions');
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }
}
