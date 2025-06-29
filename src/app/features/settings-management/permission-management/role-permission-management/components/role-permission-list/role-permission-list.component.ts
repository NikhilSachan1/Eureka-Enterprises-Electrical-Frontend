import { Component, OnInit, inject } from '@angular/core';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TableService } from '../../../../../../shared/services/data-table-config.service';
import { IEnhancedTable } from '../../../../../../shared/models';
import { ROLE_PERMISSION_LIST_ENHANCED_TABLE_CONFIG } from '../../config/table/role-permission-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../../../../shared/types';

@Component({
  selector: 'app-role-permission-list',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './role-permission-list.component.html',
  styleUrl: './role-permission-list.component.scss'
})
export class RolePermissionListComponent implements OnInit {

  private readonly tableService = inject(TableService);

  protected table!: IEnhancedTable;

  ngOnInit(): void {
    this.table = this.tableService.createTable(ROLE_PERMISSION_LIST_ENHANCED_TABLE_CONFIG);
    this.getTableData();
  }

  private getTableData(): void {
    this.table.setLoading(true);
    
    setTimeout(() => {
      this.table.setData([
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
      this.table.setLoading(false);
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
