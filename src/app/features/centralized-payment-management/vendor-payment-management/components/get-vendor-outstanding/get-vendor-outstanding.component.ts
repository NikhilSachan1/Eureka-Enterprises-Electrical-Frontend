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
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import {
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  IEnhancedTable,
  ISectionHeaderConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { ICONS } from '@shared/constants';
import { BankDetailsCellComponent } from '../../../shared/components/bank-details-cell/bank-details-cell.component';
import { PaymentOutstandingSectionComponent } from '../../../shared/components/payment-outstanding-section/payment-outstanding-section.component';
import {
  createVendorOutstandingTableEnhancedConfig,
  SEARCH_FILTER_VENDOR_OUTSTANDING_FORM_CONFIG,
} from '../../config';
import { VendorOutstandingService } from '../../services/vendor-outstanding.service';
import {
  IVendorOutstandingGetBaseResponseDto,
  IVendorOutstandingGetFormDto,
  IVendorOutstandingGetResponseDto,
  IVendorOutstandingGetStatsResponseDto,
} from '../../types/vendor-outstanding.dto';
import { IVendorOutstanding } from '../../types/vendor-outstanding.interface';

@Component({
  selector: 'app-get-vendor-outstanding',
  imports: [
    PaymentOutstandingSectionComponent,
    BankDetailsCellComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-vendor-outstanding.component.html',
  styleUrl: './get-vendor-outstanding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVendorOutstandingComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vendorOutstandingService = inject(VendorOutstandingService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );

  protected readonly section = this.getSectionHeaderConfig();
  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  protected readonly summary =
    signal<IVendorOutstandingGetStatsResponseDto | null>(null);
  protected readonly totalRecords = signal(0);

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      createVendorOutstandingTableEnhancedConfig()
    );
    this.searchFilterConfig = SEARCH_FILTER_VENDOR_OUTSTANDING_FORM_CONFIG;
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadVendorOutstandingList();
  }

  private loadVendorOutstandingList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.vendorOutstandingService
      .getVendorOutstandingList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVendorOutstandingGetResponseDto) => {
          const { records, summary, totalRecords } = response;
          const mappedData = this.mapTableData(records);

          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.summary.set(summary ?? null);
          this.totalRecords.set(totalRecords);

          this.logger.logUserAction('Vendor outstanding records loaded');
        },
        error: error => {
          this.table.setData([]);
          this.summary.set(null);
          this.totalRecords.set(0);
          this.logger.logUserAction('Failed to load vendor outstanding', error);
        },
      });
  }

  private prepareParamData(): IVendorOutstandingGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IVendorOutstandingGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    records: IVendorOutstandingGetBaseResponseDto[]
  ): IVendorOutstanding[] {
    return records.map(record => ({
      id: record.vendorId,
      vendorName: record.vendorName,
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
      title: 'Vendor',
      subtitle: 'Pending vendor payments to be paid.',
      icon: ICONS.SITE.BUILDING,
    };
  }
}
