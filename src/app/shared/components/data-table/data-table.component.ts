import { Component, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    SliderModule,
    FormsModule,
    ToolbarModule,
    TooltipModule,
  ],

  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {
  @ViewChild('dt') dt!: Table;
  tableData!: any[];
  representatives!: any[];
  statuses!: any[];
  loading: boolean = true;
  activityValues: number[] = [0, 100];
  searchValue: string | undefined;
  selectedTableRows!: any;
  isSorted: boolean | null = null;
  initialValue!: any[];
  bulkActionButtons: any[] = [];

  tableConfig: any = {
    rowHover: true,
    tableUniqueemployeeId: 'id',
    displayRows: 10,
    rowsPerPageOptions: [10, 25, 50],
    showPaginator: true,
    globalFilterFields: [
      'name',
      'country.name',
      'representative.name',
      'status',
    ],
    showCheckbox: true,
  };

  tableHeader: any[] = [
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
        searchInputType: 'text', //'text', 'numeric', 'date', 'boolean', 'dropdown', 'custom'
        displayType: 'menu', //'menu', 'row', 'chip'
        showMatchModes: true,
        defaultMatchMode: 'contains',
        matchModeOptions: [
          { label: 'Equals', value: 'equals' },
          { label: 'Contains', value: 'contains' },
        ],
        showOperator: true,
        defaultOperator: 'and', //'and', 'or'
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
        searchInputType: 'text', //'text', 'numeric', 'date', 'boolean', 'custom'
        displayType: 'menu', //'menu', 'row', 'chip'
        showMatchModes: true,
        defaultMatchMode: 'contains',
        showOperator: true,
        defaultOperator: 'and', //'and', 'or'
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
        rounded: 'false',
      },
      showFilter: true,
      filterConfig: {
        filterField: 'status',
        searchInputType: 'dropdown', //'text', 'numeric', 'date', 'boolean', 'custom'
        filterDropdownOptions: ['Active', 'Inactive', 'On Leave'],
        displayType: 'menu', //'menu', 'row', 'chip'
        showMatchModes: true,
        defaultMatchMode: 'equals',
        showOperator: true,
        defaultOperator: 'and', //'and', 'or'
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
        searchInputType: 'text', //'text', 'numeric', 'date', 'boolean', 'custom'
        displayType: 'menu', //'menu', 'row', 'chip'
        showMatchModes: true,
        defaultMatchMode: 'contains',
        showOperator: true,
        defaultOperator: 'and', //'and', 'or'
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
        operatorOptions: [
          { label: 'And', value: 'and' },
          { label: 'Or', value: 'or' },
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
        searchInputType: 'text', //'text', 'numeric', 'date', 'boolean', 'custom'
        displayType: 'menu', //'menu', 'row', 'chip'
        showMatchModes: true,
        defaultMatchMode: 'contains',
        showOperator: true,
        defaultOperator: 'and', //'and', 'or'
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
        operatorOptions: [
          { label: 'And', value: 'and' },
          { label: 'Or', value: 'or' },
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
        searchInputType: 'text', //'text', 'numeric', 'date', 'boolean', 'custom'
        displayType: 'menu', //'menu', 'row', 'chip'
        showMatchModes: true,
        defaultMatchMode: 'contains',
        showOperator: true,
        defaultOperator: 'and', //'and', 'or'
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
        operatorOptions: [
          { label: 'And', value: 'and' },
          { label: 'Or', value: 'or' },
        ],
        maxAddRuleConstraints: 1,
        numberFormatting: true,
      },
      showSort: false,
    },
  ];

  ngOnInit() {
    this.bulkActionButtons = this.getBulkActionButtons();
    setTimeout(() => {
      this.tableData = [
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
          status: 'Active',
          contactNumber: '9345678901',
          email: 'emily.clark@example.com',
          dateOfJoining: '2020-09-25',
          dateOfLeaving: '2021-09-25',
        },
      ];

      this.loading = false;
    }, 150);
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }

  clearSelection() {
    this.selectedTableRows = [];
  }

  onGlobalFilter(event: Event, table: Table) {
    const target = event.target as HTMLInputElement;
    table.filterGlobal(target.value, 'contains');
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'inactive':
        return 'danger';

      case 'active':
        return 'success';

      case 'new':
        return 'info';

      case 'on leave':
        return 'warn';

      default:
        return 'secondary';
    }
  }

  resolveNestedProperty(item: any, path: string): any {
    if (!item || !path) return null;
    
    const properties = path.split('.');
    return properties.reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : null;
    }, item);
  }

  getBulkActionButtons() {
    const bulkActionButtons = [
      {
        label: 'Set In-active',
        icon: 'pi pi-download',
        styleClass: 'p-button-sm',
        outlined: true,
        click: () => {
          console.log('Export');
        },
        severity: 'primary',
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'p-button-sm',
        outlined: true,
        click: () => {
          console.log('Delete');
        },
        severity: 'danger',
      },
    ];

    return bulkActionButtons;
  }
}
