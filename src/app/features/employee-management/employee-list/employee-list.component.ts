import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { MetricsCardComponent } from '../../../shared/components/metrics-card/metrics-card.component';
import { TableColumn } from '../../../shared/interfaces/table-column.interface';
import { TableFilter } from '../../../shared/interfaces/table-filter.interface';

// Type definitions for better type safety
interface Department {
  name: string;
  code: string;
}

interface Employee {
  id: number;
  name: string;
  designation: string;
  department: Department;
  company: string;
  date: Date | string;
  lastWorkingDate: Date | string | null;
  status: string;
  contactNumber: string;
  email: string;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent,
    DataTableComponent,
    MetricsCardComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmployees: Employee[] = [];
  loading: boolean = true;
  
  // Dynamic filters configuration
  tableFilters: TableFilter[] = [];
  
  // Table column configuration
  tableColumns: TableColumn[] = [
    { 
      field: 'name', 
      header: 'Employee Name', 
      filterType: 'text',
      bodyTemplate: 'nameWithAvatar',
      secondaryField: 'company'
    },
    { 
      field: 'designation', 
      header: 'Role & Department', 
      filterType: 'text',
      bodyTemplate: 'textWithSubtitle',
      secondaryField: 'department.name',
    },
    { 
      field: 'status', 
      header: 'Status', 
      filterType: 'text',
      bodyTemplate: 'status'
    },
    { 
      field: 'contactNumber', 
      header: 'Contact Number', 
      filterType: 'text'
    },
    { 
      field: 'email', 
      header: 'Email Address', 
      filterType: 'text',
      bodyTemplate: 'email'
    },
    { 
      field: 'date', 
      header: 'Employment Period', 
      filterType: 'date',
      bodyTemplate: 'dateRange',
      secondaryField: 'lastWorkingDate',
      labelPrimary: 'Start',
      labelSecondary: 'End'
    }
  ];
  
  // Global filter fields
  globalFilterFields: string[] = ['name', 'designation', 'department.name', 'status', 'email'];
  
  // Employee distribution metrics
  employeeDistribution = {
    title: 'Employee Distribution',
    subtitle: 'Current workforce status',
    iconClass: 'pi pi-chart-pie text-blue-500',
    iconBgClass: 'bg-blue-50',
    metrics: [
      { label: 'Active', value: 2 },
      { label: 'On Leave', value: 1 },
      { label: 'Terminated', value: 1 }
    ]
  };
  
  // Department metrics
  departmentMetrics = {
    title: 'Department Strength',
    subtitle: 'Employee by department',
    iconClass: 'pi pi-users text-purple-500',
    iconBgClass: 'bg-purple-50',
    metrics: [
      { label: 'IT', value: 2 },
      { label: 'HR', value: 1 },
      { label: 'Finance', value: 1 }
    ]
  };
  
  // Row actions
  rowActions = [
    { id: 'edit', icon: 'pi pi-pencil', class: 'p-button-text p-button-sm p-button-secondary' },
    { id: 'delete', icon: 'pi pi-trash', class: 'p-button-text p-button-sm p-button-danger' }
  ];
  
  // Bulk actions
  bulkActions = [
    { id: 'setInactive', label: 'Set Inactive', icon: 'pi pi-user-minus', class: 'p-button-secondary p-button-sm' },
    { id: 'delete', label: 'Delete', icon: 'pi pi-trash', class: 'p-button-danger p-button-sm' },
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initializeEmployees();
    this.configureFilters();
  }

  // Initialize test employee data
  private initializeEmployees(): void {
    this.loading = true;
    const employeeData: Partial<Employee>[] = [
      {
        id: 1001,
        name: 'James Wilson',
        designation: 'Senior Software Engineer',
        department: {
          name: 'IT Department',
          code: 'it'
        },
        company: 'Eureka Enterprises',
        date: '2024-01-15',
        lastWorkingDate: null,
        status: 'Active',
        contactNumber: '+1 (555) 123-4567',
        email: 'james.wilson@eureka.com'
      },
      {
        id: 1002,
        name: 'Sarah Johnson',
        designation: 'HR Manager',
        department: {
          name: 'HR Department',
          code: 'hr'
        },
        company: 'Eureka Enterprises',
        date: '2023-11-20',
        lastWorkingDate: null,
        status: 'On Leave',
        contactNumber: '+1 (555) 234-5678',
        email: 'sarah.johnson@eureka.com'
      },
      {
        id: 1003,
        name: 'Michael Brown',
        designation: 'Financial Analyst',
        department: {
          name: 'Finance Department',
          code: 'fin'
        },
        company: 'Eureka Enterprises',
        date: '2024-02-01',
        lastWorkingDate: null,
        status: 'Active',
        contactNumber: '+1 (555) 345-6789',
        email: 'michael.brown@eureka.com'
      },
      {
        id: 1004,
        name: 'Emily Davis',
        designation: 'Software Developer',
        department: {
          name: 'IT Department',
          code: 'it'
        },
        company: 'Eureka Enterprises',
        date: '2023-08-15',
        lastWorkingDate: '2024-01-31',
        status: 'Terminated',
        contactNumber: '+1 (555) 456-7890',
        email: 'emily.davis@eureka.com'
      }
    ];

    // Convert to proper employee objects with date formatting
    this.employees = employeeData as Employee[];
    this.employees.forEach((employee) => {
      if (typeof employee.date === 'string') {
        employee.date = new Date(employee.date);
      }
      if (employee.lastWorkingDate && typeof employee.lastWorkingDate === 'string') {
        employee.lastWorkingDate = new Date(employee.lastWorkingDate);
      }
    });
    
    this.loading = false;
  }

  // Configure dynamic filters for the data table
  private configureFilters(): void {
    this.tableFilters = [
      {
        field: 'status',
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
          { label: 'On Leave', value: 'On Leave' },
          { label: 'Terminated', value: 'Terminated' }
        ],
        selected: null,
        placeholder: 'Filter by Status',
        showTags: false
      },
      {
        field: 'department.code',
        options: [
          { label: 'IT Department', value: 'it' },
          { label: 'HR Department', value: 'hr' },
          { label: 'Finance Department', value: 'fin' }
        ],
        selected: null,
        placeholder: 'Filter by Department',
        showTags: false
      }
    ];
  }

  onAddEmployee() {
    // Logic to handle adding a new employee
    console.log('Add new employee clicked');
  }

  onFilterChange(event: {field: string, value: any}) {
    console.log('Filter changed:', event);
  }

  onRowAction(event: {actionId: string, item: any}) {
    const { actionId, item } = event;
    
    if (actionId === 'edit') {
      console.log('Edit employee:', item);
      // Handle edit logic
    } else if (actionId === 'delete') {
      this.confirmDeleteEmployee(item);
    }
  }

  onBulkAction(event: {actionId: string, items: any[]}) {
    const { actionId, items } = event;
    
    if (actionId === 'setInactive') {
      this.confirmSetInactive(items);
    } else if (actionId === 'delete') {
      this.confirmDeleteSelected(items);
    }
  }

  confirmSetInactive(employees: Employee[]): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to set ${employees.length} employee(s) as inactive?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        employees.forEach(employee => {
          const index = this.employees.findIndex(e => e.id === employee.id);
          if (index !== -1) {
            this.employees[index] = { ...employee, status: 'Inactive' };
          }
        });
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${employees.length} employee(s) set to inactive`
        });
        
        this.selectedEmployees = [];
      }
    });
  }

  confirmDeleteEmployee(employee: Employee): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${employee.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employees = this.employees.filter(e => e.id !== employee.id);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Employee deleted successfully'
        });
      }
    });
  }

  confirmDeleteSelected(employees: Employee[]): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${employees.length} selected employee(s)?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employees = this.employees.filter(
          e => !employees.some(se => se.id === e.id)
        );
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${employees.length} employee(s) deleted successfully`
        });
        
        this.selectedEmployees = [];
      }
    });
  }
}
