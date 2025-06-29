import { Component, OnInit, signal, inject } from '@angular/core';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DataTableConfigService } from '../../../../../../shared/services/data-table-config.service';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../../../../shared/models';
import { USERS_PERMISSION_LIST_BULK_ACTIONS_CONFIG, USERS_PERMISSION_LIST_ROW_ACTIONS_CONFIG, USERS_PERMISSION_LIST_TABLE_CONFIG, USERS_PERMISSION_LIST_TABLE_HEADER } from '../../config/table/users-permission-list-table.config';
import { EBulkActionType, ERowActionType, EDialogType, EFieldType } from '../../../../../../shared/types';

@Component({
  selector: 'app-users-permission-list',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './users-permission-list.component.html',
  styleUrl: './users-permission-list.component.scss'
})
export class UsersPermissionListComponent implements OnInit {

  private readonly dataTableConfigService = inject(DataTableConfigService);

  protected tableConfig = signal<IDataTableConfig>({} as IDataTableConfig);
  protected tableHeader = signal<IDataTableHeaderConfig[]>([]);
  protected tableData = signal<any[]>([]);
  protected loading = signal<boolean>(true);
  protected bulkActionButtons = signal<IBulkActionConfig[]>([]);
  protected rowActions = signal<IRowActionConfig[]>([]);

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
    return this.dataTableConfigService.getTableConfig(USERS_PERMISSION_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(USERS_PERMISSION_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(USERS_PERMISSION_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(USERS_PERMISSION_LIST_ROW_ACTIONS_CONFIG);
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'Super Admin',
          permissionCount: 47,
          status: 'Active'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          role: 'Project Manager',
          permissionCount: 23,
          status: 'Active'
        },
        {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@company.com',
          role: 'Site Supervisor',
          permissionCount: 15,
          status: 'Active'
        },
        {
          id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@company.com',
          role: 'Field Worker',
          permissionCount: 8,
          status: 'Active'
        },
        {
          id: '5',
          name: 'Robert Brown',
          email: 'robert.brown@company.com',
          role: 'HR Manager',
          permissionCount: 18,
          status: 'Inactive'
        },
        {
          id: '6',
          name: 'Lisa Anderson',
          email: 'lisa.anderson@company.com',
          role: 'Finance Officer',
          permissionCount: 12,
          status: 'Active'
        },
        {
          id: '7',
          name: 'David Miller',
          email: 'david.miller@company.com',
          role: 'Field Worker',
          permissionCount: 8,
          status: 'Active'
        },
        {
          id: '8',
          name: 'Jennifer Garcia',
          email: 'jennifer.garcia@company.com',
          role: 'Site Supervisor',
          permissionCount: 15,
          status: 'Inactive'
        }
      ]);
      this.loading.set(false);
    }, 1000);
  }

  protected handleBulkActionClick(action: string): void {    
    switch (action) {
      case EBulkActionType.APPROVE:
        console.log('Bulk approve users');
        break;
      case EBulkActionType.REJECT:
        console.log('Bulk deactivate users');
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        console.log('View user');
        break;
      case ERowActionType.EDIT:
        console.log('Edit user');
        break;
      case ERowActionType.DELETE:
        console.log('Delete user');
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }
}
