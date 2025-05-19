import { Component, signal, inject } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { MetricsCardComponent } from '../../../shared/components/metrics-card/metrics-card.component';
import { DataTableConfigService } from '../../../shared/services/data-table-config.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../shared/models/data-table-config.model';
import { EMPLOYEE_LIST_TABLE_CONFIG, EMPLOYEE_LIST_TABLE_HEADER, EMPLOYEE_LIST_BULK_ACTIONS_CONFIG, EMPLOYEE_LIST_ROW_ACTIONS_CONFIG } from './employee-list.config';
import { EBulkActionType, ERowActionType } from '../../../shared/types';
import { ConfirmationActionType, CONFIRMATION_DIALOG_CONFIG } from '../../../shared/config/confirmation-dialog.config';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    PageHeaderComponent, 
    DataTableComponent, 
    MetricsCardComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent {
  private readonly dataTableConfigService = inject(DataTableConfigService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  
  protected loading = signal(true);
  protected tableData = signal<any[]>([]);
  protected tableConfig = signal<IDataTableConfig>(this.getTableConfig());
  protected tableHeader = signal<IDataTableHeaderConfig[]>(this.getTableHeader());
  protected metricsCards = signal(this.getMetricCardsData());
  protected bulkActionButtons = signal<IBulkActionConfig[]>(this.getBulkActionButtons());
  protected rowActions = signal<IRowActionConfig[]>(this.getRowActions());

  ngOnInit(): void {
    this.getTableData();
  }

  // Table Configuration Methods
  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(EMPLOYEE_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(EMPLOYEE_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(EMPLOYEE_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(EMPLOYEE_LIST_ROW_ACTIONS_CONFIG);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.SET_INACTIVE:
        this.confirmSetInactive();
        break;
      case EBulkActionType.DELETE:
        this.confirmDeleteEmployees();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    } 
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        this.viewEmployeeDetails();
        break;
      case ERowActionType.EDIT:
        this.editEmployeeDetails();
        break;
      case ERowActionType.DELETE:
        this.confirmDeleteEmployee();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  // Business Logic Methods
  private setEmployeesInactive(): void {
    console.log('Setting employees as inactive:');
    // Implement actual logic here
  }

  private deleteEmployees(): void {
    console.log('Deleting multiple employees:');
    // Implement actual logic here
  }

  private viewEmployeeDetails(): void {
    console.log('Viewing employee details:');
    // Implement actual logic here
  }

  private editEmployeeDetails(): void {
    console.log('Editing employee details:');
    // Implement actual logic here
  }

  private deleteEmployee(): void {
    console.log('Deleting single employee:');
    // Implement actual logic here
  }

  protected onAddEmployee(): void {
    console.log('Adding new employee:');
    // Implement actual logic here
  }

  private confirmDeleteEmployees(): void {
    this.confirmationDialogService.confirm({
      actionType: ConfirmationActionType.DELETE,
      itemName: 'employee',
      isPlural: true
    }).subscribe(result => {
      if (result.confirmed) {
        this.deleteEmployees();
        console.log(result.message); // "Action confirmed successfully"
        console.log('Comment:', result.comment);
      } else {
        console.log(result.message); // "Action cancelled"
      }
    });
  }

  private confirmDeleteEmployee(): void {
    this.confirmationDialogService.confirm({
      actionType: ConfirmationActionType.DELETE,
      itemName: 'employee',
      isPlural: false
    }).subscribe(result => {
      if (result.confirmed) {
        this.deleteEmployee();
        console.log(result.message); // "Action confirmed successfully"
        console.log('Comment:', result.comment);
      } else {
        console.log(result.message); // "Action cancelled"
      }
    });
  }

  private confirmSetInactive(): void {
    this.confirmationDialogService.confirm({
      actionType: ConfirmationActionType.DELETE,
      itemName: 'employee',
      isPlural: true,
      customMessage: 'Are you sure you want to set the selected employees as inactive?',
      customHeader: 'Set Inactive'
    }).subscribe(result => {
      if (result.confirmed) {
        this.setEmployeesInactive();
        console.log(result.message); // "Action confirmed successfully"
        console.log('Comment:', result.comment);
      } else {
        console.log(result.message); // "Action cancelled"
      }
    });
  }

  // Data Methods
  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd755',
          employeeId: 1001,
          name: 'James Butt',
          role: 'Software Engineer',
          department: 'IT',
          status: 'Active',
          contactNumber: '9876543210',
          email: 'james.butt@example.com',
          dateOfJoining: '2020-01-01',
          dateOfLeaving: '2022-01-01',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd756',
          employeeId: 1002,
          name: 'Mary Smith',
          role: 'Product Manager',
          department: 'IT',
          status: 'On Leave',
          contactNumber: '9123456789',
          email: 'mary.smith@example.com',
          dateOfJoining: '2019-03-15',
          dateOfLeaving: '2021-03-15',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd757',
          employeeId: 1003,
          name: 'John Doe',
          role: 'UX Designer',
          department: 'IT',
          status: 'Active',
          contactNumber: '9988776655',
          email: 'john.doe@example.com',
          dateOfJoining: '2021-07-10',
          dateOfLeaving: '2022-07-10',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd758',
          employeeId: 1004,
          name: 'Sara Lee',
          role: 'QA Analyst',
          department: 'Driver',
          status: 'Inactive',
          contactNumber: '8899776655',
          email: 'sara.lee@example.com',
          dateOfJoining: '2018-11-20',
          dateOfLeaving: '2020-11-20',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd759',
          employeeId: 1005,
          name: 'Michael Brown',
          role: 'DevOps Engineer',
          department: 'IT',
          status: 'Active',
          contactNumber: '9011223344',
          email: 'michael.brown@example.com',
          dateOfJoining: '2022-04-01',
          dateOfLeaving: '2023-04-01',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd760',
          employeeId: 1006,
          name: 'Emily Clark',
          role: 'Frontend Developer',
          department: 'IT',
          status: 'Active',
          contactNumber: '9345678901',
          email: 'emily.clark@example.com',
          dateOfJoining: '2020-09-25',
          dateOfLeaving: '2021-09-25',
        },
      ]);
      this.loading.set(false);
    }, 150);
  }

  private getMetricCardsData(): any[] {
    return [
      {
        title: 'Employee Distribution',
        subtitle: 'Current workforce status',
        iconClass: 'pi pi-chart-pie text-blue-500',
        iconBgClass: 'bg-blue-50',
        metrics: [
          { label: 'Active', value: 2 },
          { label: 'On Leave', value: 1 },
          { label: 'Terminated', value: 1 },
        ],
      },
      {
        title: 'Department Strength',
        subtitle: 'Employee by department',
        iconClass: 'pi pi-users text-purple-500',
        iconBgClass: 'bg-purple-50',
        metrics: [
          { label: 'IT', value: 2 },
          { label: 'HR', value: 1 },
          { label: 'Finance', value: 1 },
        ],
      }
    ];
  }
}
