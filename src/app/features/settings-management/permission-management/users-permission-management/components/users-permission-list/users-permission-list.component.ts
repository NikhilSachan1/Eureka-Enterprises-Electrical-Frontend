import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  DataTableComponent,
  ConfirmationDialogComponent,
} from '@shared/components';
import { TableService } from '@shared/services';
import { IEnhancedTable } from '@shared/models';
import { USERS_PERMISSION_LIST_ENHANCED_TABLE_CONFIG } from '@features/settings-management/permission-management/users-permission-management/config/table/users-permission-list-table.config';
import { EBulkActionType, ERowActionType } from '@shared/types';
import { LoggerService } from '@app/core/services';

@Component({
  selector: 'app-users-permission-list',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './users-permission-list.component.html',
  styleUrl: './users-permission-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPermissionListComponent implements OnInit {
  private readonly tableService = inject(TableService);
  private readonly logger = inject(LoggerService);

  protected table!: IEnhancedTable;

  ngOnInit(): void {
    this.table = this.tableService.createTable(
      USERS_PERMISSION_LIST_ENHANCED_TABLE_CONFIG
    );
    this.getTableData();
  }

  private getTableData(): void {
    this.table.setLoading(true);

    setTimeout(() => {
      this.table.setData([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          role: 'Super Admin',
          permissionCount: 47,
          status: 'Active',
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          role: 'Project Manager',
          permissionCount: 23,
          status: 'Active',
        },
        {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@company.com',
          role: 'Site Supervisor',
          permissionCount: 15,
          status: 'Active',
        },
        {
          id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@company.com',
          role: 'Field Worker',
          permissionCount: 8,
          status: 'Active',
        },
        {
          id: '5',
          name: 'Robert Brown',
          email: 'robert.brown@company.com',
          role: 'HR Manager',
          permissionCount: 18,
          status: 'Inactive',
        },
        {
          id: '6',
          name: 'Lisa Anderson',
          email: 'lisa.anderson@company.com',
          role: 'Finance Officer',
          permissionCount: 12,
          status: 'Active',
        },
        {
          id: '7',
          name: 'David Miller',
          email: 'david.miller@company.com',
          role: 'Field Worker',
          permissionCount: 8,
          status: 'Active',
        },
        {
          id: '8',
          name: 'Jennifer Garcia',
          email: 'jennifer.garcia@company.com',
          role: 'Site Supervisor',
          permissionCount: 15,
          status: 'Inactive',
        },
      ]);
      this.table.setLoading(false);
    }, 1000);
  }

  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.APPROVE:
        // console.log('Bulk approve users');
        break;
      case EBulkActionType.REJECT:
        // console.log('Bulk deactivate users');
        break;
      default:
      // console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        // console.log('View user');
        break;
      case ERowActionType.EDIT:
        // console.log('Edit user');
        break;
      case ERowActionType.DELETE:
        // console.log('Delete user');
        break;
      default:
      // console.warn('Unknown row action:', action);
    }
  }
}
