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
import { CONTRACTOR_LIST_BULK_ACTIONS_CONFIG, CONTRACTOR_LIST_ROW_ACTIONS_CONFIG, CONTRACTOR_LIST_TABLE_CONFIG, CONTRACTOR_LIST_TABLE_HEADER } from '../config/table/contractor-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../../shared/types';
import { EDialogType } from '../../../../shared/types/confirmation-dialog.types';

@Component({
  selector: 'app-contractor-list',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent, DataTableComponent],
  templateUrl: './contractor-list.component.html',
  styleUrl: './contractor-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractorListComponent implements OnInit {

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
        title: 'Total Contractors',
        subtitle: 'Overview of registered contractors',
        iconClass: 'pi pi-users text-green-500',
        iconBgClass: 'bg-green-50',
        metrics: [
          { label: 'Active', value: 8 },
          { label: 'Inactive', value: 2 },
          { label: 'Total', value: 10 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(CONTRACTOR_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(CONTRACTOR_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(CONTRACTOR_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(CONTRACTOR_LIST_ROW_ACTIONS_CONFIG);
  }

  protected onAddButtonClick(): void {
    console.log('Adding new contractor:');
    // Implement actual logic here
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '1',
          contractorId: 'CONT001',
          contractorName: 'ABC Electrical Contractors',
          contactNumber: '+91 9876543210',
          emailAddress: 'info@abcelectrical.com',
          gstNumber: '29ABCDE1234F1Z5',
          category: 'Electrical',
          addedBy: 'John Doe',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-15',
          status: 'Active',
        },
        {
          id: '2',
          contractorId: 'CONT002',
          contractorName: 'XYZ Civil Works',
          contactNumber: '+91 8765432109',
          emailAddress: 'contact@xyzcivil.com',
          gstNumber: '27FGHIJ5678K2M6',
          category: 'Civil',
          addedBy: 'Jane Smith',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-14',
          status: 'Active',
        },
        {
          id: '3',
          contractorId: 'CONT003',
          contractorName: 'DEF Mechanical Services',
          contactNumber: '+91 7654321098',
          emailAddress: 'hello@defmechanical.com',
          gstNumber: '33NOPQR9012L3S7',
          category: 'Mechanical',
          addedBy: 'Mike Johnson',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-13',
          status: 'Active',
        },
        {
          id: '4',
          contractorId: 'CONT004',
          contractorName: 'GHI Plumbing Solutions',
          contactNumber: '+91 6543210987',
          emailAddress: 'info@ghiplumbing.com',
          gstNumber: '19TUVWX3456Y4A8',
          category: 'Plumbing',
          addedBy: 'Sarah Wilson',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-12',
          status: 'Inactive',
        },
        {
          id: '5',
          contractorId: 'CONT005',
          contractorName: 'JKL HVAC Systems',
          contactNumber: '+91 5432109876',
          emailAddress: 'contact@jklhvac.com',
          gstNumber: '07BCDEF7890G5H9',
          category: 'HVAC',
          addedBy: 'David Brown',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-11',
          status: 'Active',
        },
        {
          id: '6',
          contractorId: 'CONT006',
          contractorName: 'MNO Industrial Contractors',
          contactNumber: '+91 4321098765',
          emailAddress: 'info@mnoindustrial.com',
          gstNumber: '11IJKLM1234N6O0',
          category: 'Other',
          addedBy: 'Lisa Davis',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-10',
          status: 'Active',
        },
        {
          id: '7',
          contractorId: 'CONT007',
          contractorName: 'PQR Electrical Works',
          contactNumber: '+91 3210987654',
          emailAddress: 'hello@pqrelectrical.com',
          gstNumber: '23PQRST5678U7V1',
          category: 'Electrical',
          addedBy: 'Tom Anderson',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-09',
          status: 'Active',
        },
        {
          id: '8',
          contractorId: 'CONT008',
          contractorName: 'STU Civil Engineering',
          contactNumber: '+91 2109876543',
          emailAddress: 'contact@stucivil.com',
          gstNumber: '31WXYZ9012A8B2',
          category: 'Civil',
          addedBy: 'Emma Taylor',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-08',
          status: 'Inactive',
        },
        {
          id: '9',
          contractorId: 'CONT009',
          contractorName: 'VWX Mechanical Contractors',
          contactNumber: '+91 1098765432',
          emailAddress: 'info@vwxmechanical.com',
          gstNumber: '15CDEF3456G9H3',
          category: 'Mechanical',
          addedBy: 'Alex Wilson',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-07',
          status: 'Active',
        },
        {
          id: '10',
          contractorId: 'CONT010',
          contractorName: 'YZA Plumbing & HVAC',
          contactNumber: '+91 0987654321',
          emailAddress: 'hello@yzaplumbing.com',
          gstNumber: '27IJKL7890M0N4',
          category: 'Plumbing',
          addedBy: 'Rachel Green',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-06',
          status: 'Active',
        }
      ]);
      this.loading.set(false);
    }, 150);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.DELETE:
        this.confirmDeleteContractorsDialog();
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
        this.confirmDeleteContractorDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  private confirmDeleteContractorsDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        recordDetails: {
          title: 'Contractor Details',
          details: [
            { label: 'Contractor Name', value: 'ABC Electrical Contractors' },
            { label: 'Contact Number', value: '+91 9876543210' },
            { label: 'Email Address', value: 'info@abcelectrical.com' },
            { label: 'GST Number', value: '29ABCDE1234F1Z5' },
            { label: 'Category', value: 'Electrical' }
          ]
        }
      },
      () => alert('Delete contractors'),
      () => console.log('Delete operation cancelled')
    );
  }

  private confirmDeleteContractorDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        recordDetails: {
          title: 'Contractor Details',
          details: [
            { label: 'Contractor Name', value: 'ABC Electrical Contractors' },
            { label: 'Contact Number', value: '+91 9876543210' },
            { label: 'Email Address', value: 'info@abcelectrical.com' },
            { label: 'GST Number', value: '29ABCDE1234F1Z5' },
            { label: 'Category', value: 'Electrical' }
          ]
        }
      },
      () => alert('Delete contractor'),
      () => console.log('Delete operation cancelled')
    );
  }
}
