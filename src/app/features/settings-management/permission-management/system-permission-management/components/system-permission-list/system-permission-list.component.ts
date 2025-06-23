import { Component, OnInit, signal } from '@angular/core';
import { DataTableComponent } from '../../../../../../shared/components/data-table/data-table.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DataTableConfigService } from '../../../../../../shared/services/data-table-config.service';
import { ConfirmationDialogService } from '../../../../../../shared/services/confirmation-dialog-config.service';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../../../../shared/models';
import { SYSTEM_PERMISSION_LIST_BULK_ACTIONS_CONFIG, SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG, SYSTEM_PERMISSION_LIST_TABLE_CONFIG, SYSTEM_PERMISSION_LIST_TABLE_HEADER } from '../../config/table/system-permission-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../../../../shared/types';

@Component({
  selector: 'app-system-permission-list',
  imports: [DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './system-permission-list.component.html',
  styleUrl: './system-permission-list.component.scss'
})
export class SystemPermissionListComponent implements OnInit {

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
    return this.dataTableConfigService.getTableConfig(SYSTEM_PERMISSION_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(SYSTEM_PERMISSION_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(SYSTEM_PERMISSION_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(SYSTEM_PERMISSION_LIST_ROW_ACTIONS_CONFIG);
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '2715b251-c614-4463-a15e-47792bfa700',
          name: 'LEAVE_ADD_BUTTON',
          module: 'Leave',
          label: 'Add Leave Button',
          description: 'Allows user to add new leave requests',
          status: 'Active'
        },
        {
          id: '345be73-9341-43b7-9dec-8cc66a9a842',
          name: 'LEAVE_CANCEL_BUTTON',
          module: 'Leave',
          label: 'Cancel Leave Button',
          description: 'Allows user to cancel leave requests',
          status: 'Active'
        },
        {
          id: '98d6c10c-d394-4bd4-8a8c-6a0ad47866a2',
          name: 'LEAVE_APPROVE_BUTTON',
          module: 'Leave',
          label: 'Approve Leave Button',
          description: 'Allows user to approve leave requests',
          status: 'Inactive'
        },
        {
          id: '9c76c8af-3b26-43cb-9e82-a604ff5e6392',
          name: 'ATTENDANCE_ADD_BUTTON',
          module: 'Attendance',
          label: 'Add Attendance Button',
          description: 'Allows user to add new attendance requests',
          status: 'Active'
        }
      ]);
      this.loading.set(false);
    }, 1000);
  }

  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.APPROVE:
        console.log('Activate permissions');
        break;
      case EBulkActionType.REJECT:
        console.log('Deactivate permissions');
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.APPROVE:
        console.log('Activate permission');
        break;
      case ERowActionType.EDIT:
        console.log('Edit permission');
        break;
      case ERowActionType.REJECT:
        console.log('Deactivate permission');
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }
}
