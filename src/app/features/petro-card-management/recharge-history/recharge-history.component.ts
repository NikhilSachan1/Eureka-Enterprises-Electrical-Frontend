import { Component, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MetricsCardComponent } from '../../../shared/components/metrics-card/metrics-card.component';
import { LoggerService } from '../../../core/services/logger.service';
import { inject, ChangeDetectionStrategy } from '@angular/core';
import { IMetricData } from '../../../shared/models/metric-data.model';
import { DataTableComponent } from "../../../shared/components/data-table/data-table.component";
import { DataTableConfigService } from '../../../shared/services/data-table-config.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog-config.service';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../shared/models';
import { RECHARGE_HISTORY_BULK_ACTIONS_CONFIG, RECHARGE_HISTORY_ROW_ACTIONS_CONFIG, RECHARGE_HISTORY_TABLE_CONFIG, RECHARGE_HISTORY_TABLE_HEADER } from '../config/table/recharge-history-table.config';
import { EBulkActionType, ERowActionType } from '../../../shared/types';
import { EDialogType } from '../../../shared/types/confirmation-dialog.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recharge-history',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent, DataTableComponent],
  templateUrl: './recharge-history.component.html',
  styleUrl: './recharge-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RechargeHistoryComponent implements OnInit {

  // Dependency Injection
  private readonly logger = inject(LoggerService);
  private readonly dataTableConfigService = inject(DataTableConfigService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly router = inject(Router);

  // Signals
  protected metricsCards = signal<IMetricData[]>([]);
  protected tableConfig = signal<IDataTableConfig>(this.getTableConfig());
  protected tableHeader = signal<IDataTableHeaderConfig[]>([]);
  protected tableData = signal<any[]>([]);
  protected loading = signal<boolean>(true);
  protected bulkActionButtons = signal<IBulkActionConfig[]>([]);
  protected rowActions = signal<IRowActionConfig[]>([]);

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.metricsCards.set(this.getMetricCardsData());
    this.tableConfig.set(this.getTableConfig());
    this.tableHeader.set(this.getTableHeader());
    this.bulkActionButtons.set(this.getBulkActionButtons());
    this.rowActions.set(this.getRowActions());
    this.getTableData();
  }

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Account Balance',
        subtitle: 'Current balance overview',
        iconClass: 'pi pi-wallet text-green-500',
        iconBgClass: 'bg-green-50',
        metrics: [
          { label: 'Remaining Balance ($)', value: 8450 },
          { label: 'Days Since Last Recharge', value: 2 },
          { label: 'Alert Threshold ($)', value: 1000 },
        ],
      },
      {
        title: 'Current Month',
        subtitle: 'January 2024 recharge summary',
        iconClass: 'pi pi-calendar text-blue-500',
        iconBgClass: 'bg-blue-50',
        metrics: [
          { label: 'Recharge Amount ($)', value: 2750 },
          { label: 'Transactions', value: 8 },
          { label: 'Avg. Amount ($)', value: 344 },
        ],
      },
      {
        title: 'Previous Month',
        subtitle: 'December 2023 recharge summary',
        iconClass: 'pi pi-chart-line text-orange-500',
        iconBgClass: 'bg-orange-50',
        metrics: [
          { label: 'Recharge Amount ($)', value: 3200 },
          { label: 'Transactions', value: 10 },
          { label: 'Total Lifetime ($)', value: 45600 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(RECHARGE_HISTORY_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(RECHARGE_HISTORY_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(RECHARGE_HISTORY_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(RECHARGE_HISTORY_ROW_ACTIONS_CONFIG);
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '1',
          rechargeAmount: 500,
          rechargeDate: '2024-01-15',
          rechargeMethod: 'Credit Card',
          description: 'Monthly fuel account recharge',
          referenceNumber: 'REF-2024-001',
          status: 'Completed',
        },
        {
          id: '2',
          rechargeAmount: 750,
          rechargeDate: '2024-01-14',
          rechargeMethod: 'Bank Transfer',
          description: 'Fleet fuel top-up',
          referenceNumber: 'REF-2024-002',
          status: 'Completed',
        },
        {
          id: '3',
          rechargeAmount: 300,
          rechargeDate: '2024-01-13',
          rechargeMethod: 'Cash',
          description: 'Emergency fuel recharge',
          referenceNumber: 'REF-2024-003',
          status: 'Pending',
        },
        {
          id: '4',
          rechargeAmount: 1000,
          rechargeDate: '2024-01-12',
          rechargeMethod: 'Credit Card',
          description: 'Bulk fuel account refill',
          referenceNumber: 'REF-2024-004',
          status: 'Completed',
        },
        {
          id: '5',
          rechargeAmount: 200,
          rechargeDate: '2024-01-11',
          rechargeMethod: 'Online Transfer',
          description: 'Quick fuel top-up',
          referenceNumber: 'REF-2024-005',
          status: 'Failed',
        },
        {
          id: '6',
          rechargeAmount: 450,
          rechargeDate: '2024-01-10',
          rechargeMethod: 'Check',
          description: 'Weekly fuel recharge',
          referenceNumber: 'REF-2024-006',
          status: 'Completed',
        },
      ]);
      this.loading.set(false);
    }, 150);
  }

  // Event Handler Methods
  protected onAddButtonClick(): void {
    this.logger.info('Add recharge button clicked');
    // Navigate to add recharge page
    this.router.navigate(['/card/recharge/add']);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.DELETE:
        this.confirmDeleteRechargeDialog();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        this.viewRechargeDetails();
        break;
      case ERowActionType.EDIT:
        this.editRechargeDetails();
        break;
      case ERowActionType.DELETE:
        this.confirmDeleteRechargeDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  // Business Logic Methods
  private viewRechargeDetails(): void {
    this.logger.info('Viewing recharge details');
    // Implement actual logic here
  }

  private editRechargeDetails(): void {
    this.logger.info('Editing recharge details');
    // Implement actual logic here
  }

  // Dialog Methods
  private confirmDeleteRechargeDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        recordDetails: {
          title: 'Recharge Details',
          details: [
            { label: 'Amount', value: '$500' },
            { label: 'Date', value: '2024-01-15' },
            { label: 'Method', value: 'Credit Card' },
            { label: 'Description', value: 'Monthly fuel account recharge' },
            { label: 'Reference', value: 'REF-2024-001' },
          ]
        }
      },
      () => this.deleteRecharge(),
      () => console.log('Delete operation cancelled')
    );
  }

  private deleteRecharge(): void {
    this.logger.info('Deleting recharge record');
    // Implement actual logic here
  }
}
