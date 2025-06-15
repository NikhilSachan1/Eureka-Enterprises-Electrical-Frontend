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
import { PETRO_CARD_LIST_BULK_ACTIONS_CONFIG, PETRO_CARD_LIST_ROW_ACTIONS_CONFIG, PETRO_CARD_LIST_TABLE_CONFIG, PETRO_CARD_LIST_TABLE_HEADER } from '../config/table/petro-card-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../shared/types';
import { EDialogType } from '../../../shared/types/confirmation-dialog.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-petro-card-list',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent, DataTableComponent],
  templateUrl: './petro-card-list.component.html',
  styleUrl: './petro-card-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PetroCardListComponent implements OnInit {

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
        title: 'Card Status',
        subtitle: 'Current petro card status overview',
        iconClass: 'pi pi-credit-card text-blue-500',
        iconBgClass: 'bg-blue-50',
        metrics: [
          { label: 'Active', value: 18 },
          { label: 'Expired', value: 3 },
          { label: 'Blocked', value: 1 },
        ],
      },
      {
        title: 'Usage Status',
        subtitle: 'Card allocation overview',
        iconClass: 'pi pi-users text-green-500',
        iconBgClass: 'bg-green-50',
        metrics: [
          { label: 'Assigned', value: 15 },
          { label: 'Available', value: 6 },
          { label: 'Reserved', value: 1 },
        ],
      },
      {
        title: 'Expiry Status',
        subtitle: 'Card expiry overview',
        iconClass: 'pi pi-calendar text-orange-500',
        iconBgClass: 'bg-orange-50',
        metrics: [
          { label: 'Valid', value: 18 },
          { label: 'Expiring Soon', value: 2 },
          { label: 'Expired', value: 2 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(PETRO_CARD_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(PETRO_CARD_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(PETRO_CARD_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(PETRO_CARD_LIST_ROW_ACTIONS_CONFIG);
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '1',
          cardName: 'Shell Fuel Card',
          cardNumber: 'SHL-001-123456',
          expiryDate: '2025-12-31',
          holderName: 'John Smith',
          status: 'Active',
        },
        {
          id: '2',
          cardName: 'BP Business Card',
          cardNumber: 'BP-002-789012',
          expiryDate: '2024-06-30',
          holderName: 'Sarah Johnson',
          status: 'Active',
        },
        {
          id: '3',
          cardName: 'Texaco Fleet Card',
          cardNumber: 'TEX-003-345678',
          expiryDate: '2025-03-15',
          holderName: 'Mike Wilson',
          status: 'Active',
        },
        {
          id: '4',
          cardName: 'Esso Corporate Card',
          cardNumber: 'ESO-004-901234',
          expiryDate: '2024-11-20',
          holderName: 'Lisa Davis',
          status: 'Expiring Soon',
        },
        {
          id: '5',
          cardName: 'Total Access Card',
          cardNumber: 'TOT-005-567890',
          expiryDate: '2023-08-15',
          holderName: 'Robert Brown',
          status: 'Expired',
        },
      ]);
      this.loading.set(false);
    }, 150);
  }

  // Event Handler Methods
  protected onAddButtonClick(): void {
    this.logger.info('Add petro card button clicked');
    // Navigate to add petro card page
    this.router.navigate(['/card/add']);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.DELETE:
        this.confirmDeleteCardDialog();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        this.viewCardDetails();
        break;
      case ERowActionType.EDIT:
        this.editCardDetails();
        break;
      case ERowActionType.DELETE:
        this.confirmDeleteCardDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  // Business Logic Methods
  private viewCardDetails(): void {
    this.logger.info('Viewing petro card details');
    // Implement actual logic here
  }

  private editCardDetails(): void {
    this.logger.info('Editing petro card details');
    // Implement actual logic here
  }

  // Dialog Methods
  private confirmDeleteCardDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        recordDetails: {
          title: 'Petro Card Details',
          details: [
            { label: 'Card Name', value: 'Shell Fuel Card' },
            { label: 'Card Number', value: 'SHL-001-123456' },
            { label: 'Expiry Date', value: '2025-12-31' },
            { label: 'Holder Name', value: 'John Smith' },
          ]
        }
      },
      () => this.deleteCard(),
      () => console.log('Delete operation cancelled')
    );
  }

  private deleteCard(): void {
    this.logger.info('Deleting petro card');
    // Implement actual logic here
  }
}
