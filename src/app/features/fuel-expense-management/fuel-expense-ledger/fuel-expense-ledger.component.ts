import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { LoggerService } from '../../../core/services/logger.service';
import { IDataTableConfig, IDataTableHeaderConfig, IBulkActionConfig, IRowActionConfig } from '../../../shared/models';
import { IMetricData } from '../../../shared/models/metric-data.model';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog-config.service';
import { DataTableConfigService } from '../../../shared/services/data-table-config.service';
import { EBulkActionType, ERowActionType } from '../../../shared/types';
import { EConfirmationDialogRecordDetailInputType, EDialogType } from '../../../shared/types/confirmation-dialog.types';
import { MetricsCardComponent } from "../../../shared/components/metrics-card/metrics-card.component";
import { DataTableComponent } from "../../../shared/components/data-table/data-table.component";
import { ConfirmationDialogComponent } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { FUEL_EXPENSE_LIST_BULK_ACTIONS_CONFIG, FUEL_EXPENSE_LIST_ROW_ACTIONS_CONFIG, FUEL_EXPENSE_LIST_TABLE_CONFIG, FUEL_EXPENSE_LIST_TABLE_HEADER } from '../config/table/fuel-expense-ledger-table.config';

@Component({
  selector: 'app-fuel-expense-ledger',
  imports: [PageHeaderComponent, MetricsCardComponent, DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './fuel-expense-ledger.component.html',
  styleUrl: './fuel-expense-ledger.component.scss'
})
export class FuelExpenseLedgerComponent implements OnInit {

  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly dataTableConfigService = inject(DataTableConfigService);

  protected readonly loading = signal<boolean>(true);
  protected readonly tableData = signal<any[]>([]);
  protected readonly metricsCards = signal<IMetricData[]>([]);
  protected readonly tableConfig = signal<IDataTableConfig>({} as IDataTableConfig);
  protected readonly tableHeader = signal<IDataTableHeaderConfig[]>([]);
  protected readonly bulkActionButtons = signal<IBulkActionConfig[]>([]);
  protected readonly rowActions = signal<IRowActionConfig[]>([]);

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
        title: 'Approval Status',
        subtitle: 'Fuel expense approval overview',
        iconClass: 'pi pi-check-circle text-green-500',
        iconBgClass: 'bg-green-50',
        metrics: [
          { label: 'Approved', value: 8 },
          { label: 'Pending', value: 5 },
          { label: 'Rejected', value: 2 },
        ],
      },
      {
        title: 'Monthly Summary',
        subtitle: 'Monthly fuel expense summary',
        iconClass: 'pi pi-car text-blue-500',
        iconBgClass: 'bg-blue-50',
        metrics: [
          { label: 'Total Fuel Cost', value: 25000 },
          { label: 'Total Liters', value: 450 },
          { label: 'Total Vehicles', value: 12 },
        ],
      },
      {
        title: 'Fuel Efficiency',
        subtitle: 'Fleet fuel efficiency metrics',
        iconClass: 'pi pi-chart-line text-purple-500',
        iconBgClass: 'bg-purple-50',
        metrics: [
          { label: 'Average KM/L', value: 15.2 },
          { label: 'Best Performer', value: 18.5 },
          { label: 'Worst Performer', value: 12.1 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(FUEL_EXPENSE_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(FUEL_EXPENSE_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(FUEL_EXPENSE_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(FUEL_EXPENSE_LIST_ROW_ACTIONS_CONFIG);
  }

  protected onAddButtonClick(): void {
    this.logger.logUserAction('Navigate to Add Fuel Expense Form');
    this.router.navigate(['/fuel-expenses/add']);
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: 1,
          fuelFilledDate: '2024-01-15',
          fuelType: 'Diesel',
          amount: 2500,
          paymentMode: 'Card',
          fuelFilledReceipt: 'https://example.com/receipts/fuel-receipt-001.pdf',
          fuelFilledAtKms: 15000,
          vehicleMeterReadingProof: 'https://example.com/proofs/meter-001.jpg',
          fuelFilledQty: 50,
          pumpMeterReadingProof: 'https://example.com/proofs/pump-001.jpg',
          vehicleNumber: 'KA01AB1234',
          vehicleAvg: 15.5,
          approvalStatus: 'Approved',
          entryType: 'Debit',
        },
        {
          id: 2,
          fuelFilledDate: '2024-01-16',
          fuelType: 'Petrol',
          amount: 1800,
          paymentMode: 'UPI',
          fuelFilledReceipt: 'https://example.com/receipts/fuel-receipt-002.pdf',
          fuelFilledAtKms: 8500,
          vehicleMeterReadingProof: 'https://example.com/proofs/meter-002.jpg',
          fuelFilledQty: 35,
          pumpMeterReadingProof: 'https://example.com/proofs/pump-002.jpg',
          vehicleNumber: 'KA02CD5678',
          vehicleAvg: 18.2,
          approvalStatus: 'Pending',
          entryType: 'Credit',
        },
        {
          id: 3,
          fuelFilledDate: '2024-01-17',
          fuelType: 'Diesel',
          amount: 3200,
          paymentMode: 'Cash',
          fuelFilledReceipt: null,
          fuelFilledAtKms: 22000,
          vehicleMeterReadingProof: 'https://example.com/proofs/meter-003.jpg',
          fuelFilledQty: 60,
          pumpMeterReadingProof: null,
          vehicleNumber: 'KA03EF9012',
          vehicleAvg: 14.8,
          approvalStatus: 'Rejected',
          entryType: 'Debit',
        },
        {
          id: 4,
          fuelFilledDate: '2024-01-18',
          fuelType: 'CNG',
          amount: 800,
          paymentMode: 'Bank Transfer',
          fuelFilledReceipt: 'https://example.com/receipts/fuel-receipt-004.pdf',
          fuelFilledAtKms: 12000,
          vehicleMeterReadingProof: 'https://example.com/proofs/meter-004.jpg',
          fuelFilledQty: 25,
          pumpMeterReadingProof: 'https://example.com/proofs/pump-004.jpg',
          vehicleNumber: 'KA04GH3456',
          vehicleAvg: 22.5,
          approvalStatus: 'Pending',
          entryType: 'Debit',
        },
        {
          id: 5,
          fuelFilledDate: '2024-01-19',
          fuelType: 'Petrol',
          amount: 2100,
          paymentMode: 'Card',
          fuelFilledReceipt: 'https://example.com/receipts/fuel-receipt-005.pdf',
          fuelFilledAtKms: 18500,
          vehicleMeterReadingProof: 'https://example.com/proofs/meter-005.jpg',
          fuelFilledQty: 40,
          pumpMeterReadingProof: 'https://example.com/proofs/pump-005.jpg',
          vehicleNumber: 'KA05IJ7890',
          vehicleAvg: 16.8,
          approvalStatus: 'Approved',
          entryType: 'Debit',
        }
      ]);
      this.loading.set(false);
    }, 150);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.APPROVE:
        this.confirmApproveFuelExpenseDialog();
        break;
      case EBulkActionType.REJECT:
        this.confirmRejectFuelExpenseDialog();
        break;
      case EBulkActionType.DELETE:
        this.confirmDeleteFuelExpenseDialog();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        console.log('View fuel expense details');
        break;
      case ERowActionType.DELETE:
        this.confirmDeleteFuelExpenseDialog();
        break;
      case ERowActionType.APPROVE:
        this.confirmApproveFuelExpenseDialog();
        break;
      case ERowActionType.REJECT:
        this.confirmRejectFuelExpenseDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  private confirmApproveFuelExpenseDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.APPROVE,
      {
        recordDetails: {
          title: 'Fuel Expense Details',
          details: [
            { label: 'Date', value: new Date(), type: EConfirmationDialogRecordDetailInputType.DATE },
            { label: 'Fuel Type', value: 'Diesel' },
            { label: 'Amount', value: 2500, type: EConfirmationDialogRecordDetailInputType.CURRENCY },
            { label: 'Payment Mode', value: 'Cash' },
            { label: 'Vehicle Number', value: 'MH01AB1234' }
          ]
        }
      },
      () => alert('Approve fuel expense'),
      () => console.log('Approve operation cancelled')
    );
  }

  private confirmRejectFuelExpenseDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.REJECT,
      {
        recordDetails: {
          title: 'Fuel Expense Details',
          details: [
            { label: 'Date', value: new Date(), type: EConfirmationDialogRecordDetailInputType.DATE },
            { label: 'Fuel Type', value: 'Diesel' },
            { label: 'Amount', value: 2500, type: EConfirmationDialogRecordDetailInputType.CURRENCY },
            { label: 'Payment Mode', value: 'Cash' },
            { label: 'Vehicle Number', value: 'MH01AB1234' }
          ]
        }
      },
      () => alert('Reject fuel expense'),
      () => console.log('Reject operation cancelled')
    );
  }

  private confirmDeleteFuelExpenseDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        recordDetails: {
          title: 'Fuel Expense Details',
          details: [
            { label: 'Date', value: new Date(), type: EConfirmationDialogRecordDetailInputType.DATE },
            { label: 'Fuel Type', value: 'Diesel' },
            { label: 'Amount', value: 2500, type: EConfirmationDialogRecordDetailInputType.CURRENCY },
            { label: 'Payment Mode', value: 'Cash' },
            { label: 'Vehicle Number', value: 'MH01AB1234' }
          ]
        }
      },
      () => alert('Delete fuel expense'),
      () => console.log('Delete operation cancelled')
    );
  }
}
