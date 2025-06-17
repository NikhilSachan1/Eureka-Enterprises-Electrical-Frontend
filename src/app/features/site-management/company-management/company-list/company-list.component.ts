import { Component, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MetricsCardComponent } from '../../../../shared/components/metrics-card/metrics-card.component';
import { inject, ChangeDetectionStrategy } from '@angular/core';
import { IMetricData } from '../../../../shared/models/metric-data.model';
import { DataTableComponent } from "../../../../shared/components/data-table/data-table.component";
import { DataTableConfigService } from '../../../../shared/services/data-table-config.service';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog-config.service';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../../shared/models';
import { COMPANY_LIST_BULK_ACTIONS_CONFIG, COMPANY_LIST_ROW_ACTIONS_CONFIG, COMPANY_LIST_TABLE_CONFIG, COMPANY_LIST_TABLE_HEADER } from '../config/table/company-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../../shared/types';
import { EDialogType } from '../../../../shared/types/confirmation-dialog.types';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent, DataTableComponent],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyListComponent implements OnInit {

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

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Total Companies',
        subtitle: 'Overview of registered companies',
        iconClass: 'pi pi-building text-blue-500',
        iconBgClass: 'bg-blue-50',
        metrics: [
          { label: 'Active', value: 12 },
          { label: 'Inactive', value: 3 },
          { label: 'Total', value: 15 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(COMPANY_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(COMPANY_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(COMPANY_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(COMPANY_LIST_ROW_ACTIONS_CONFIG);
  }

  protected onAddButtonClick(): void {
    console.log('Adding new company:');
    // Implement actual logic here
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '1',
          companyId: 'COMP001',
          companyName: 'ABC Construction Ltd',
          contactNumber: '+91 9876543210',
          emailAddress: 'info@abcconstruction.com',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          addedBy: 'John Doe',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-15',
          status: 'Active',
        },
        {
          id: '2',
          companyId: 'COMP002',
          companyName: 'XYZ Infrastructure Pvt Ltd',
          contactNumber: '+91 8765432109',
          emailAddress: 'contact@xyzinfra.com',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          addedBy: 'Jane Smith',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-14',
          status: 'Active',
        },
        {
          id: '3',
          companyId: 'COMP003',
          companyName: 'DEF Engineering Solutions',
          contactNumber: '+91 7654321098',
          emailAddress: 'hello@defengineering.com',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          addedBy: 'Mike Johnson',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-13',
          status: 'Inactive',
        },
        {
          id: '4',
          companyId: 'COMP004',
          companyName: 'GHI Electrical Works',
          contactNumber: '+91 6543210987',
          emailAddress: 'info@ghielectrical.com',
          city: 'Mysore',
          state: 'Karnataka',
          pincode: '570001',
          addedBy: 'Sarah Wilson',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-12',
          status: 'Inactive',
        },
        {
          id: '5',
          companyId: 'COMP005',
          companyName: 'JKL Power Systems',
          contactNumber: '+91 5432109876',
          emailAddress: 'contact@jklpower.com',
          city: 'Hubli',
          state: 'Karnataka',
          pincode: '580001',
          addedBy: 'David Brown',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-11',
          status: 'Active',
        },
        {
          id: '6',
          companyId: 'COMP006',
          companyName: 'MNO Industrial Services',
          contactNumber: '+91 4321098765',
          emailAddress: 'info@mnoindustrial.com',
          city: 'Belgaum',
          state: 'Karnataka',
          pincode: '590001',
          addedBy: 'Lisa Davis',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-10',
          status: 'Inactive',
        },
        {
          id: '7',
          companyId: 'COMP007',
          companyName: 'PQR Construction Co',
          contactNumber: '+91 3210987654',
          emailAddress: 'hello@pqrconstruction.com',
          city: 'Nagpur',
          state: 'Maharashtra',
          pincode: '440001',
          addedBy: 'Tom Anderson',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-09',
          status: 'Active',
        },
        {
          id: '8',
          companyId: 'COMP008',
          companyName: 'STU Electrical Contractors',
          contactNumber: '+91 2109876543',
          emailAddress: 'contact@stuelectrical.com',
          city: 'Gulbarga',
          state: 'Karnataka',
          pincode: '585101',
          addedBy: 'Emma Taylor',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-08',
          status: 'Inactive',
        }
      ]);
      this.loading.set(false);
    }, 150);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.DELETE:
        this.confirmDeleteCompaniesDialog();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        break;
      case ERowActionType.EDIT:
        break;
      case ERowActionType.DELETE:
        this.confirmDeleteCompanyDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  private confirmDeleteCompaniesDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        recordDetails: {
          title: 'Company Details',
          details: [
            { label: 'Company Name', value: 'ABC Construction Ltd' },
            { label: 'Contact Number', value: '+91 9876543210' },
            { label: 'Email Address', value: 'info@abcconstruction.com' },
            { label: 'City', value: 'Bangalore' },
            { label: 'State', value: 'Karnataka' },
            { label: 'Pincode', value: '560001' }
          ]
        }
      },
      () => alert('Delete companies'),
      () => console.log('Delete operation cancelled')
    );
  }

  private confirmDeleteCompanyDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        recordDetails: {
          title: 'Company Details',
          details: [
            { label: 'Company Name', value: 'ABC Construction Ltd' },
            { label: 'Contact Number', value: '+91 9876543210' },
            { label: 'Email Address', value: 'info@abcconstruction.com' },
            { label: 'City', value: 'Bangalore' },
            { label: 'State', value: 'Karnataka' },
            { label: 'Pincode', value: '560001' }
          ]
        }
      },
      () => alert('Delete company'),
      () => console.log('Delete operation cancelled')
    );
  }
} 