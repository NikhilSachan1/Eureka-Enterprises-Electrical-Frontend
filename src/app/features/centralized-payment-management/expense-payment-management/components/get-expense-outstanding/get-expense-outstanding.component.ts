import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { IEnhancedTable, ISectionHeaderConfig } from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { ICONS } from '@shared/constants';
import { BankDetailsCellComponent } from '../../../shared/components/bank-details-cell/bank-details-cell.component';
import { PaymentOutstandingSectionComponent } from '../../../shared/components/payment-outstanding-section/payment-outstanding-section.component';
import { createExpenseOutstandingTableEnhancedConfig } from '../../config';
import { ExpenseOutstandingService } from '../../services/expense-outstanding.service';
import {
  IExpenseOutstandingGetBaseResponseDto,
  IExpenseOutstandingGetFormDto,
  IExpenseOutstandingGetResponseDto,
  IExpenseOutstandingGetStatsResponseDto,
} from '../../types/expense-outstanding.dto';
import { IExpenseOutstanding } from '../../types/expense-outstanding.interface';

@Component({
  selector: 'app-get-expense-outstanding',
  imports: [
    PaymentOutstandingSectionComponent,
    BankDetailsCellComponent,
    DataTableComponent,
  ],
  templateUrl: './get-expense-outstanding.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetExpenseOutstandingComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly expenseOutstandingService = inject(
    ExpenseOutstandingService
  );
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );

  protected readonly section = this.getSectionHeaderConfig();
  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  protected readonly summary =
    signal<IExpenseOutstandingGetStatsResponseDto | null>(null);
  protected readonly totalRecords = signal(0);
  protected readonly searchTerm = signal('');

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      createExpenseOutstandingTableEnhancedConfig()
    );
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadExpenseOutstandingList();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (this.tableFilterData) {
      this.tableFilterData = { ...this.tableFilterData, first: 0 };
    }
    this.loadExpenseOutstandingList();
  }

  private loadExpenseOutstandingList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.expenseOutstandingService
      .getExpenseOutstandingList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IExpenseOutstandingGetResponseDto) => {
          const { records, summary, totalRecords } = response;
          const mappedData = this.mapTableData(records);

          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.summary.set(summary ?? null);
          this.totalRecords.set(totalRecords);

          this.logger.logUserAction('Expense outstanding records loaded');
        },
        error: error => {
          this.table.setData([]);
          this.summary.set(null);
          this.totalRecords.set(0);
          this.logger.logUserAction(
            'Failed to load expense outstanding',
            error
          );
        },
      });
  }

  private prepareParamData(): IExpenseOutstandingGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IExpenseOutstandingGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    return {
      ...base,
      ...(this.searchTerm() ? { search: this.searchTerm() } : {}),
    };
  }

  private mapTableData(
    records: IExpenseOutstandingGetBaseResponseDto[]
  ): IExpenseOutstanding[] {
    return records.map(record => ({
      id: record.userId,
      employeeName: record.userName,
      employeeCode: record.employeeId,
      pendingAmount: record.pendingAmount,
      transactionType:
        record.pendingAmount > 0
          ? 'debit'
          : record.pendingAmount < 0
            ? 'credit'
            : undefined,
      bankDetails: record.bankDetails,
      originalRawData: record,
    }));
  }

  private getSectionHeaderConfig(): ISectionHeaderConfig {
    return {
      title: 'Expense',
      subtitle: 'Pending expense reimbursements to be paid.',
      icon: ICONS.EXPENSE.MONEY,
    };
  }
}
