import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { IOutstandingBalanceSectionSnapshot } from '@features/centralized-payment-management/outstanding-balance-management/types/outstanding-balance-summary.interface';
import { LoggerService } from '@core/services';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { IEnhancedTable } from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { PaymentOutstandingSectionComponent } from '../../../shared/components/payment-outstanding-section/payment-outstanding-section.component';
import { isWalletOutstandingRowSelectionDisabled } from '../../../shared/config/payment-outstanding-source-section.config';
import { createWalletOutstandingTableEnhancedConfig } from '../../config';
import { WalletOutstandingService } from '../../services/wallet-outstanding.service';
import {
  IWalletOutstandingGetBaseResponseDto,
  IWalletOutstandingGetFormDto,
  IWalletOutstandingGetResponseDto,
} from '../../types/wallet-outstanding.dto';
import { IWalletOutstanding } from '../../types/wallet-outstanding.interface';

@Component({
  selector: 'app-get-wallet-outstanding',
  imports: [PaymentOutstandingSectionComponent, DataTableComponent],
  templateUrl: './get-wallet-outstanding.component.html',
  styleUrl: './get-wallet-outstanding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetWalletOutstandingComponent implements OnInit {
  selectionChange = output<IWalletOutstandingGetBaseResponseDto[]>();
  sectionSummaryChange = output<IOutstandingBalanceSectionSnapshot>();
  excludedRechargeIds = input<ReadonlySet<string>>(new Set());
  showSelection = input(true);

  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly walletOutstandingService = inject(WalletOutstandingService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      createWalletOutstandingTableEnhancedConfig()
    );
    this.syncRowSelectionRules();
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadWalletOutstandingList();
  }

  protected onSelectionChange(selectedRows: Record<string, unknown>[]): void {
    this.selectionChange.emit(
      selectedRows as IWalletOutstandingGetBaseResponseDto[]
    );
  }

  private syncRowSelectionRules(): void {
    if (!this.table) {
      return;
    }

    const excludedRechargeIds = this.excludedRechargeIds();

    this.table.updateTableConfig({
      showCheckbox: this.showSelection(),
      disableRowSelectionWhen: row =>
        isWalletOutstandingRowSelectionDisabled(row, excludedRechargeIds),
    });
  }

  private loadWalletOutstandingList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.walletOutstandingService
      .getWalletOutstandingList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IWalletOutstandingGetResponseDto) => {
          const { records, totalRecords, totalOutstanding } = response;
          const mappedData = this.mapTableData(records);

          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.sectionSummaryChange.emit({
            totalRecords,
            totalPendingAmount: totalOutstanding ?? 0,
          });

          this.logger.logUserAction('Wallet outstanding records loaded');
        },
        error: error => {
          this.table.setData([]);
          this.sectionSummaryChange.emit({
            totalRecords: 0,
            totalPendingAmount: 0,
          });
          this.logger.logUserAction('Failed to load wallet outstanding', error);
        },
      });
  }

  private prepareParamData(): IWalletOutstandingGetFormDto {
    return this.tableServerSideFilterAndSortService.resolvePagination(
      this.tableFilterData
    );
  }

  private mapTableData(
    records: IWalletOutstandingGetBaseResponseDto[]
  ): IWalletOutstanding[] {
    return records.map(record => ({
      ...record,
      pendingAmount: record.amount,
      transactionType: 'debit',
      originalRawData: record,
    }));
  }
}
