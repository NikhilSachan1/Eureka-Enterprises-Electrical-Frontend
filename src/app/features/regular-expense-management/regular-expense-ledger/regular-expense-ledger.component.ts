import { Component, inject, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { LoggerService } from '../../../core/services/logger.service';
import { IDataTableConfig, IDataTableHeaderConfig, IBulkActionConfig, IRowActionConfig } from '../../../shared/models';
import { IMetricData } from '../../../shared/models/metric-data.model';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog-config.service';
import { DataTableConfigService } from '../../../shared/services/data-table-config.service';
import { EBulkActionType, ERowActionType } from '../../../shared/types';
import { EDialogType } from '../../../shared/types/confirmation-dialog.types';
import { MetricsCardComponent } from "../../../shared/components/metrics-card/metrics-card.component";
import { DataTableComponent } from "../../../shared/components/data-table/data-table.component";
import { ConfirmationDialogComponent } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { REGULAR_EXPENSE_LIST_BULK_ACTIONS_CONFIG, REGULAR_EXPENSE_LIST_ROW_ACTIONS_CONFIG, REGULAR_EXPENSE_LIST_TABLE_CONFIG, REGULAR_EXPENSE_LIST_TABLE_HEADER } from '../config/table/regular-expense-ledger-table.config';

@Component({
  selector: 'app-regular-expense-ledger',
  imports: [PageHeaderComponent, MetricsCardComponent, DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './regular-expense-ledger.component.html',
  styleUrl: './regular-expense-ledger.component.scss'
})
export class RegularExpenseLedgerComponent implements OnInit {

  private readonly dataTableConfigService = inject(DataTableConfigService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly logger = inject(LoggerService);

  protected loading = signal(true);
  protected tableData = signal<any[]>([]);
  protected tableConfig = signal<IDataTableConfig>(this.getTableConfig());
  protected tableHeader = signal<IDataTableHeaderConfig[]>(this.getTableHeader(),);
  protected metricsCards = signal(this.getMetricCardsData());
  protected bulkActionButtons = signal<IBulkActionConfig[]>(this.getBulkActionButtons(),);
  protected rowActions = signal<IRowActionConfig[]>(this.getRowActions());

  ngOnInit(): void {
    this.getTableData();
  }

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Approval Status',
        subtitle: 'Request approval overview',
        iconClass: 'pi pi-check-circle text-green-500',
        iconBgClass: 'bg-green-50',
        metrics: [
          { label: 'Approved', value: 5 },
          { label: 'Pending', value: 3 },
          { label: 'Rejected', value: 1 },
        ],
      },
      {
        title: 'Monthly Summary',
        subtitle: 'Monthly expense summary',
        iconClass: 'pi pi-money-bill text-purple-500',
        iconBgClass: 'bg-purple-50',
        metrics: [
          { label: 'Opening Balance', value: 15 },
          { label: 'Closing Balance', value: 3 },
          { label: 'Total Credit', value: 2 },
          { label: 'Total Debit', value: 1 },
        ],
      },
      {
        title: 'Eureka Monthly Summary',
        subtitle: 'Monthly eureka expense summary',
        iconClass: 'pi pi-money-bill text-purple-500',
        iconBgClass: 'bg-purple-50',
        metrics: [
          { label: 'Opening Balance', value: 15 },
          { label: 'Closing Balance', value: 3 },
          { label: 'Total Approved Debit', value: 1 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(REGULAR_EXPENSE_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(REGULAR_EXPENSE_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(REGULAR_EXPENSE_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(REGULAR_EXPENSE_LIST_ROW_ACTIONS_CONFIG);
  }

  protected onAddButtonClick(): void {
    console.log('Adding new employee:');
    // Implement actual logic here
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: 1,
          name: 'John Doe',
          employeeId: '1234567890',
          expenseDate: '2024-01-01',
          expenseType: 'Fuel',
          expenseAmount: 100,
          paymentMode: 'Cash',
          expenseProof: 'https://example.com/receipts/fuel-receipt-001.pdf',
          comment: 'Comment',
          approvalStatus: 'Pending',
          entryType: 'Credit',
        },
        {
          id: 2,
          name: 'Jane Doe',
          employeeId: '1234567890',
          expenseDate: '2024-01-02',
          expenseType: 'Maintenance',
          expenseAmount: 200,
          paymentMode: 'Bank',
          expenseProof: 'https://example.com/receipts/maintenance-receipt-002.jpg',
          comment: 'Comment',
          approvalStatus: 'Approved',
          entryType: 'Debit',
        },
        {
          id: 3,
          name: 'John Doe',
          employeeId: '1234567890',
          expenseDate: '2024-01-03',
          expenseType: 'Fuel',
          expenseAmount: 100,
          paymentMode: 'Cash',
          expenseProof: null,
          comment: 'Comment',
          approvalStatus: 'Rejected',
          entryType: 'Credit',
        },
        {
          id: 4,
          name: 'John Doe',
          employeeId: '1234567890',
          expenseDate: '2024-01-04',
          expenseType: 'Fuel',
          expenseAmount: 100,
          paymentMode: 'Cash',
          expenseProof: 'https://example.com/receipts/fuel-receipt-004.png',
          comment: 'Comment',
          approvalStatus: 'Pending',
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
        this.confirmApproveExpenseDialog();
        break;
      case EBulkActionType.REJECT:
        this.confirmRejectExpenseDialog();
        break;
      case EBulkActionType.DELETE:
        this.confirmDeleteExpenseDialog();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        break;
      case ERowActionType.DELETE:
        this.confirmDeleteExpenseDialog();
        break;
      case ERowActionType.APPROVE:
        this.confirmApproveExpenseDialog();
        break;
      case ERowActionType.REJECT:
        this.confirmRejectExpenseDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  private confirmApproveExpenseDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.APPROVE,
      () => alert('Approve expense'),
      () => console.log('Approve operation cancelled'),
    );
  }

  private confirmRejectExpenseDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.REJECT,
      () => alert('Reject expense'),
      () => console.log('Reject operation cancelled'),
    );
  }

  private confirmDeleteExpenseDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      () => alert('Delete expense'),
      () => console.log('Delete operation cancelled'),
    );
  }

}
