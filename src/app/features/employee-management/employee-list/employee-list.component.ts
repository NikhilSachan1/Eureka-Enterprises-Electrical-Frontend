import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ProgressBar } from 'primeng/progressbar';
import { SliderModule } from 'primeng/slider';
import { TooltipModule } from 'primeng/tooltip';
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
    DropdownModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    CommonModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    ProgressBar,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    SliderModule,
    TooltipModule,
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
  representatives: any[] = [];
  statuses: any[] = [];
  loading: boolean = true;
  activityValues: number[] = [0, 100];
  searchValue: string | undefined;
  selectedRepresentatives: any[] = [];
  selectedStatus: any = null;
  selectedActivity: number[] = [0, 100];

  @ViewChild('dt1') dt1: Table | undefined;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  getActiveEmployeesCount(): number {
    return this.customers.filter(c => c.status === 'Active').length;
  }

  getOtherEmployeesCount(): number {
    return this.customers.filter(c => c.status !== 'Active').length;
  }

  clearSelection(): void {
    this.selectedCustomers = [];
  }

  confirmSetInactive(): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to set ${this.selectedCustomers.length} employee(s) as inactive?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Update status to inactive for selected employees
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
        country: {
          name: 'IT Department',
          code: 'it'
        },
        company: 'Eureka Enterprises',
        date: '2024-01-15',
        status: 'Active',
        verified: true,
        activity: 85,
        representative: {
          name: 'Amy Elsner',
          image: 'amyelsner.png'
        },
        balance: 65000
      },
      {
        id: 1002,
        name: 'Sarah Johnson',
        country: {
          name: 'HR Department',
          code: 'hr'
        },
        company: 'Eureka Enterprises',
        date: '2023-11-20',
        status: 'On Leave',
        verified: true,
        activity: 45,
        representative: {
          name: 'Ioni Bowcher',
          image: 'ionibowcher.png'
        },
        balance: 55000
      },
      {
        id: 1003,
        name: 'Michael Brown',
        country: {
          name: 'Finance Department',
          code: 'fin'
        },
        company: 'Eureka Enterprises',
        date: '2024-02-01',
        status: 'Active',
        verified: true,
        activity: 92,
        representative: {
          name: 'Xuxue Feng',
          image: 'xuxuefeng.png'
        },
        balance: 72000
      },
      {
        id: 1004,
        name: 'Emily Davis',
        country: {
          name: 'IT Department',
          code: 'it'
        },
        company: 'Eureka Enterprises',
        date: '2023-08-15',
        status: 'Terminated',
        verified: false,
        activity: 0,
        representative: {
          name: 'Ivan Magalhaes',
          image: 'ivanmagalhaes.png'
        },
        balance: 0
      }
    ];

    this.customers.forEach((customer) => (customer.date = new Date(customer.date)));

    this.representatives = [
      { name: 'Amy Elsner', image: 'amyelsner.png' },
      { name: 'Anna Fali', image: 'annafali.png' },
      { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
      { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
      { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
      { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
      { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
      { name: 'Onyama Limba', image: 'onyamalimba.png' },
      { name: 'Stephen Shaw', image: 'stephenshaw.png' },
      { name: 'Xuxue Feng', image: 'xuxuefeng.png' }
    ];

    this.statuses = [
      { label: 'Unqualified', value: 'unqualified' },
      { label: 'Qualified', value: 'qualified' },
      { label: 'New', value: 'new' },
      { label: 'Negotiation', value: 'negotiation' },
      { label: 'Renewal', value: 'renewal' },
      { label: 'Proposal', value: 'proposal' }
    ];

    if (this.dt1) {
      this.dt1.filter('Active', 'status', 'equals');
    }
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
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

  onRepresentativeChange(event: any, filter: Function) {
    filter(event);
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (this.dt1) {
      this.dt1.filterGlobal(value, 'contains');
    }
  }

  onStatusChange(value: any, filter: Function) {
    filter(value);
  }

  onActivityChange(value: any, filter: Function) {
    filter(value);
  }
}
