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
import { SortEvent } from 'primeng/api';

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
  selectedProducts!: any;
  isSorted: boolean | null = null;
  initialValue!: any[];

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
        primaryFieldLabel: 'Name',
        secondaryFieldLabel: 'Employee Id',
        secondaryField: 'employeeId',
        showImage: true,
        dummyImageField: 'name',
        primaryFieldHighlight: false,
      },
      showFilter: true,
      filterConfig: {
        filterField: 'name',
        searchInputType: 'dropdown', //'text', 'numeric', 'date', 'boolean', 'dropdown', 'custom'
        displayType: 'menu', //'menu', 'row', 'chip'
        showMatchModes: true,
        defaultMatchMode: 'contains',
        matchModeOptions: [
          { label: 'Equals', value: 'equals' },
          { label: 'Contains', value: 'contains' },
          { label: 'Starts With', value: 'startsWith' },
          { label: 'Ends With', value: 'endsWith' },
          { label: 'Greater Than', value: 'greaterThan' },
        ],
        showOperator: true,
        defaultOperator: 'and', //'and', 'or'
        showClearButton: true,
        showApplyButton: true,
        showAddButton: true,
        hideOnClear: false,
        placeholder: 'Search Employee Name',
        maxAddRuleConstraints: 1,
        numberFormatting: true,
        filterDropdownOptions: [
          { label: 'Unqualified', value: 'unqualified' },
          { label: 'Qualified', value: 'qualified' },
          { label: 'New', value: 'new' },
          { label: 'Negotiation', value: 'negotiation' },
          { label: 'Renewal', value: 'renewal' },
          { label: 'Proposal', value: 'proposal' },
        ],
      },
      showSort: true,
    },
    {
      field: 'role',
      header: 'Role & Department',
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
      showSort: true,
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
        filterField: 'name',
        searchInputType: 'numeric', //'text', 'numeric', 'date', 'boolean', 'custom'
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
      showSort: true,
    },
    {
      field: 'contactNumber',
      header: 'Contact Number',
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
      showSort: true,
    },
    {
      field: 'email',
      header: 'Email',
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
      showSort: true,
    },
    {
      field: 'employmentPeriod',
      header: 'Employment Period',
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
      showSort: true,
    },
  ];

  ngOnInit() {
    setTimeout(() => {
      this.tableData = [
        {
          employeeId: 1001,
          name: 'James Butt',
          role: 'Software Engineer',
          status: 'Active',
          contactNumber: '9876543210',
          email: 'james.butt@example.com',
          employmentPeriod: '2020-01-01',
        },
        {
          employeeId: 1002,
          name: 'Mary Smith',
          role: 'Product Manager',
          status: 'On Leave',
          contactNumber: '9123456789',
          email: 'mary.smith@example.com',
          employmentPeriod: '2019-03-15',
        },
        {
          employeeId: 1003,
          name: 'John Doe',
          role: 'UX Designer',
          status: 'Active',
          contactNumber: '9988776655',
          email: 'john.doe@example.com',
          employmentPeriod: '2021-07-10',
        },
        {
          employeeId: 1004,
          name: 'Sara Lee',
          role: 'QA Analyst',
          status: 'Inactive',
          contactNumber: '8899776655',
          email: 'sara.lee@example.com',
          employmentPeriod: '2018-11-20',
        },
        {
          employeeId: 1005,
          name: 'Michael Brown',
          role: 'DevOps Engineer',
          status: 'Active',
          contactNumber: '9011223344',
          email: 'michael.brown@example.com',
          employmentPeriod: '2022-04-01',
        },
        {
          employeeId: 1006,
          name: 'Emily Clark',
          role: 'Frontend Developer',
          status: 'Active',
          contactNumber: '9345678901',
          email: 'emily.clark@example.com',
          employmentPeriod: '2020-09-25',
        },
      ];

      this.loading = false;

      this.tableData.forEach(
        (customer) => (customer.date = new Date(<Date>customer.date)),
      );
    }, 150);
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';

    console.log(this.selectedProducts);
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

  customSort(event: SortEvent) {
    if (this.isSorted == null || this.isSorted === undefined) {
      this.isSorted = true;
      this.sortTableData(event);
    } else if (this.isSorted == true) {
      this.isSorted = false;
      this.sortTableData(event);
    } else if (this.isSorted == false) {
      this.isSorted = null;
      this.tableData = [...this.initialValue];
      this.dt.reset();
    }
  }

  sortTableData(event: any) {
    event.data.sort((data1: any, data2: any) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      let result = null;
      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return event.order * result;
    });
  }

  resolveNestedProperty(item: any, path: string): any {
    if (!item || !path) return null;
    
    const properties = path.split('.');
    return properties.reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : null;
    }, item);
  }
}
