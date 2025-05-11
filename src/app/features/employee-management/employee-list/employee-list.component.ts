import { Component, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { MetricsCardComponent } from '../../../shared/components/metrics-card/metrics-card.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [PageHeaderComponent, DataTableComponent, MetricsCardComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent {
  protected loading = signal<boolean>(true);
  protected tableData = signal<any[]>([]);
  protected tableConfig = signal<any>(this.getTableConfig());
  protected tableHeader = signal<any[]>(this.getTableHeader());
  protected metricsCards = signal<any[]>(this.getMetricCardsData());
  protected bulkActionButtons = signal<any[]>(this.getBulkActionButtons());
  protected rowActions = signal<any[]>(this.getRowActions());

  ngOnInit(): void {
    this.getTableData();
  }

  private getMetricCardsData(): any[] {
    
    const metricData = [
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

    return metricData;
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
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

  private getTableConfig(): any {
    return {
      rowHover: true,
      tableUniqueId: 'employeeId',
      displayRows: 10,
      rowsPerPageOptions: [10, 25, 50],
      showPaginator: true,
      globalFilterFields: ['name', 'role', 'email', 'status'],
      showCheckbox: true,
    };
  }

  private getTableHeader(): any[] {
    return [
      {
        field: 'name',
        header: 'Employee Name',
        bodyTemplate: 'textWithSubtitleAndImage',
        textWithSubtitleAndImageConfig: {
          secondaryField: 'employeeId',
          showImage: true,
          dummyImageField: 'name',
          primaryFieldHighlight: true,
        },
        showFilter: true,
        filterConfig: {
          filterField: 'name',
          searchInputType: 'text',
          displayType: 'menu',
          showMatchModes: true,
          defaultMatchMode: 'contains',
          matchModeOptions: [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
          ],
          showOperator: true,
          defaultOperator: 'and',
          showClearButton: true,
          showApplyButton: true,
          showAddButton: true,
          hideOnClear: false,
          placeholder: 'Search Employee Name',
          maxAddRuleConstraints: 2,
          numberFormatting: false,
        },
        showSort: true,
      },
      {
        field: 'role',
        header: 'Role & Department',
        bodyTemplate: 'textWithSubtitleAndImage',
        textWithSubtitleAndImageConfig: {
          secondaryField: 'department',
          primaryFieldLabel: 'Role',
          secondaryFieldLabel: 'Department',
        },
        showFilter: true,
        filterConfig: {
          filterField: 'role',
          searchInputType: 'text',
          displayType: 'menu',
          showMatchModes: true,
          defaultMatchMode: 'contains',
          showOperator: true,
          defaultOperator: 'and',
          showClearButton: true,
          showApplyButton: true,
          showAddButton: true,
          hideOnClear: true,
          placeholder: 'Search By Role or Department',
          matchModeOptions: [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
          ],
          maxAddRuleConstraints: 2,
          numberFormatting: true,
        },
        showSort: false,
      },
      {
        field: 'status',
        header: 'Status',
        bodyTemplate: 'status',
        statusConfig: {
          rounded: false,
        },
        showFilter: true,
        filterConfig: {
          filterField: 'status',
          searchInputType: 'dropdown',
          filterDropdownOptions: ['Active', 'Inactive', 'On Leave'],
          displayType: 'menu',
          showMatchModes: true,
          defaultMatchMode: 'equals',
          showOperator: true,
          defaultOperator: 'and',
          showClearButton: true,
          showApplyButton: true,
          showAddButton: true,
          hideOnClear: true,
          placeholder: 'Search By Status',
          matchModeOptions: [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
          ],
          maxAddRuleConstraints: 1,
          numberFormatting: true,
        },
        showSort: true,
      },
      {
        field: 'contactNumber',
        header: 'Contact Number',
        showFilter: false,
        filterConfig: {
          filterField: 'name',
          searchInputType: 'text',
          displayType: 'menu',
          showMatchModes: true,
          defaultMatchMode: 'contains',
          showOperator: true,
          defaultOperator: 'and',
          showClearButton: true,
          showApplyButton: true,
          showAddButton: true,
          hideOnClear: true,
          placeholder: 'Search Employee Name',
          matchModeOptions: [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
            { label: 'Starts With', value: 'startsWith' },
            { label: 'Ends With', value: 'endsWith' },
            { label: 'Greater Than', value: 'greaterThan' },
          ],
          maxAddRuleConstraints: 1,
          numberFormatting: true,
        },
        showSort: false,
      },
      {
        field: 'email',
        header: 'Email',
        showFilter: false,
        filterConfig: {
          filterField: 'name',
          searchInputType: 'text',
          displayType: 'menu',
          showMatchModes: true,
          defaultMatchMode: 'contains',
          showOperator: true,
          defaultOperator: 'and',
          showClearButton: true,
          showApplyButton: true,
          showAddButton: true,
          hideOnClear: true,
          placeholder: 'Search Employee Name',
          matchModeOptions: [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
            { label: 'Starts With', value: 'startsWith' },
            { label: 'Ends With', value: 'endsWith' },
            { label: 'Greater Than', value: 'greaterThan' },
          ],
          maxAddRuleConstraints: 1,
          numberFormatting: true,
        },
        showSort: false,
      },
      {
        field: 'dateOfJoining',
        header: 'Employment Period',
        bodyTemplate: 'textWithSubtitleAndImage',
        dataType: 'date',
        dateFormat: 'dd-MM-yyyy',
        textWithSubtitleAndImageConfig: {
          secondaryField: 'dateOfLeaving',
          primaryFieldLabel: 'Joined On',
          secondaryFieldLabel: 'Left On',
          dataType: 'date',
        },
        showFilter: true,
        filterConfig: {
          filterField: 'name',
          searchInputType: 'text',
          displayType: 'menu',
          showMatchModes: true,
          defaultMatchMode: 'contains',
          showOperator: true,
          defaultOperator: 'and',
          showClearButton: true,
          showApplyButton: true,
          showAddButton: true,
          hideOnClear: true,
          placeholder: 'Search Employee Name',
          matchModeOptions: [
            { label: 'Equals', value: 'equals' },
            { label: 'Contains', value: 'contains' },
            { label: 'Starts With', value: 'startsWith' },
            { label: 'Ends With', value: 'endsWith' },
            { label: 'Greater Than', value: 'greaterThan' },
          ],
          maxAddRuleConstraints: 1,
          numberFormatting: true,
        },
        showSort: false,
      },
    ];
  }

  private getBulkActionButtons(): any[] {
    return [
      {
        id: 'setInactive',
        label: 'Set In-active',
        icon: 'pi pi-user-minus',
        styleClass: 'p-button-sm',
        outlined: true,
        severity: 'primary',
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'p-button-sm',
        outlined: true,
        severity: 'danger',
      },
    ];
  }

  private getRowActions(): any[] {
    return [
      {
        id: 'view',
        icon: 'pi pi-eye',
        tooltip: 'View Profile',
        severity: 'info',
        styleClass: 'p-button-text p-button-sm',
      },
      {
        id: 'edit',
        icon: 'pi pi-pencil',
        tooltip: 'Edit Employee',
        severity: 'warning',
        disabledWhen: (rowData: any) => rowData.status === 'Active',
        styleClass: 'p-button-text p-button-sm',
      },
      {
        id: 'delete',
        icon: 'pi pi-trash',
        tooltip: 'Delete Employee',
        severity: 'danger',
        disabledWhen: (rowData: any) => rowData.status === 'Active',
        styleClass: 'p-button-text p-button-sm',
      },
    ];
  }

  protected onAddEmployee(): void {
    console.log('Add new employee clicked');
  }
}
