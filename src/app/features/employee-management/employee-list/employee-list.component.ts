import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    Select,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ToolbarModule,
    DividerModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent implements OnInit {
  customers: any[] = [];
  selectedCustomers: any[] = [];
  statuses: any[] = [];
  loading: boolean = true;
  selectedStatus: any = null;

  // Static department counts
  departmentCounts = {
    'IT Department': 2,
    'HR Department': 1,
    'Finance Department': 1
  };

  // Static status counts
  statusCounts = {
    'Active': 2,
    'On Leave': 1,
    'Terminated': 1
  };

  @ViewChild('dt1') dt1: Table | undefined;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  clearSelection(): void {
    this.selectedCustomers = [];
  }

  confirmSetInactive(): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to set ${this.selectedCustomers.length} employee(s) as inactive?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.selectedCustomers.forEach(customer => {
          const index = this.customers.findIndex(c => c.id === customer.id);
          if (index !== -1) {
            this.customers[index] = { ...customer, status: 'Inactive' };
          }
        });
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${this.selectedCustomers.length} employee(s) set to inactive`
        });
        
        this.selectedCustomers = [];
      }
    });
  }

  confirmDeleteSelected(): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedCustomers.length} selected employee(s)?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.customers = this.customers.filter(
          c => !this.selectedCustomers.some(sc => sc.id === c.id)
        );
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${this.selectedCustomers.length} employee(s) deleted successfully`
        });
        
        this.selectedCustomers = [];
      }
    });
  }

  ngOnInit() {
    this.loading = false;
    this.customers = [
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
        verified: true,
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
        verified: true,
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
        verified: true,
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
        verified: false,
        contactNumber: '+1 (555) 456-7890',
        email: 'emily.davis@eureka.com'
      }
    ];

    this.customers.forEach((customer) => {
      customer.date = new Date(customer.date);
      if (customer.lastWorkingDate) {
        customer.lastWorkingDate = new Date(customer.lastWorkingDate);
      }
    });

    this.statuses = [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'On Leave', value: 'On Leave' },
      { label: 'Terminated', value: 'Terminated' }
    ];

    if (this.dt1) {
      this.dt1.filter('Active', 'status', 'equals');
    }
  }

  clear(table: Table) {
    table.clear();
  }

  getSeverity(status: string): 'success' | 'warn' | 'info' | 'danger' {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warn';
      case 'On Leave':
        return 'info';
      case 'Terminated':
        return 'danger';
      default:
        return 'info';
    }
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (this.dt1) {
      this.dt1.filterGlobal(value, 'contains');
    }
  }

  onStatusChange(event: any, table: Table) {
    if (event.value) {
      table.filter(event.value.value, 'status', 'equals');
    } else {
      table.filter(null, 'status', 'equals');
    }
  }
}
