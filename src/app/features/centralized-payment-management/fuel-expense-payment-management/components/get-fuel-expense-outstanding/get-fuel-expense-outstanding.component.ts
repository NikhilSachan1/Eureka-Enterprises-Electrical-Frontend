import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { IEnhancedTable } from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { BankDetailsCellComponent } from '../../../shared/components/bank-details-cell/bank-details-cell.component';
import { PaymentOutstandingSectionComponent } from '../../../shared/components/payment-outstanding-section/payment-outstanding-section.component';
import {
  EPaymentOutstandingSourceType,
  isPaymentOutstandingRowSelectionDisabled,
} from '../../../shared/config/payment-outstanding-source-section.config';
import { createFuelExpenseOutstandingTableEnhancedConfig } from '../../config';
import { FuelExpenseOutstandingService } from '../../services/fuel-expense-outstanding.service';
import {
  IFuelExpenseOutstandingGetBaseResponseDto,
  IFuelExpenseOutstandingGetFormDto,
  IFuelExpenseOutstandingGetResponseDto,
  IFuelExpenseOutstandingGetStatsResponseDto,
} from '../../types/fuel-expense-outstanding.dto';
import { IFuelExpenseOutstanding } from '../../types/fuel-expense-outstanding.interface';

@Component({
  selector: 'app-get-fuel-expense-outstanding',
  imports: [
    PaymentOutstandingSectionComponent,
    BankDetailsCellComponent,
    DataTableComponent,
  ],
  templateUrl: './get-fuel-expense-outstanding.component.html',
  styleUrl: './get-fuel-expense-outstanding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetFuelExpenseOutstandingComponent implements OnInit {
  selectionChange = output<IFuelExpenseOutstandingGetBaseResponseDto[]>();
  excludedUserIds = input<ReadonlySet<string>>(new Set());

  protected readonly EPaymentOutstandingSourceType =
    EPaymentOutstandingSourceType;

  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly fuelExpenseOutstandingService = inject(
    FuelExpenseOutstandingService
  );
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  protected readonly summary =
    signal<IFuelExpenseOutstandingGetStatsResponseDto | null>(null);
  protected readonly totalRecords = signal(0);
  protected readonly searchTerm = signal('');

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      createFuelExpenseOutstandingTableEnhancedConfig()
    );
    this.syncRowSelectionRules();
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadFuelExpenseOutstandingList();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (this.tableFilterData) {
      this.tableFilterData = { ...this.tableFilterData, first: 0 };
    }
    this.loadFuelExpenseOutstandingList();
  }

  protected onSelectionChange(selectedRows: Record<string, unknown>[]): void {
    this.selectionChange.emit(
      selectedRows as IFuelExpenseOutstandingGetBaseResponseDto[]
    );
  }

  private syncRowSelectionRules(): void {
    if (!this.table) {
      return;
    }

    const excludedUserIds = this.excludedUserIds();

    this.table.updateTableConfig({
      disableRowSelectionWhen: row =>
        isPaymentOutstandingRowSelectionDisabled(row, excludedUserIds),
    });
  }

  private loadFuelExpenseOutstandingList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.fuelExpenseOutstandingService
      .getFuelExpenseOutstandingList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IFuelExpenseOutstandingGetResponseDto) => {
          const { records, summary, totalRecords } = response;
          const mappedData = this.mapTableData(records);

          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.summary.set(summary ?? null);
          this.totalRecords.set(totalRecords);

          this.logger.logUserAction('Fuel expense outstanding records loaded');
        },
        error: error => {
          this.table.setData([]);
          this.summary.set(null);
          this.totalRecords.set(0);
          this.logger.logUserAction(
            'Failed to load fuel expense outstanding',
            error
          );
        },
      });
  }

  private prepareParamData(): IFuelExpenseOutstandingGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IFuelExpenseOutstandingGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    return {
      ...base,
      ...(this.searchTerm() ? { search: this.searchTerm() } : {}),
    };
  }

  private mapTableData(
    records: IFuelExpenseOutstandingGetBaseResponseDto[]
  ): IFuelExpenseOutstanding[] {
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
}
