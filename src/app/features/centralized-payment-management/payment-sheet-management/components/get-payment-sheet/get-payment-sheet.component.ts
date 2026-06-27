import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  AppConfigurationService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { SEARCH_FILTER_PAYMENT_SHEET_FORM_CONFIG } from '../../config/form/search-filter-payment-sheet.config';
import { createPaymentSheetTableEnhancedConfig } from '../../config/table/get-payment-sheet.config';
import { PaymentSheetService } from '../../services/payment-sheet.service';
import {
  IPaymentSheetGetBaseResponseDto,
  IPaymentSheetGetFormDto,
  IPaymentSheetGetResponseDto,
} from '../../types/payment-sheet.dto';
import { IPaymentSheet } from '../../types/payment-sheet.interface';

@Component({
  selector: 'app-get-payment-sheet',
  imports: [
    PageHeaderComponent,
    SearchFilterComponent,
    DataTableComponent,
    CurrencyPipe,
  ],
  templateUrl: './get-payment-sheet.component.html',
  styleUrl: './get-payment-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetPaymentSheetComponent implements OnInit {
  protected readonly APP_CONFIG = APP_CONFIG;

  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly paymentSheetService = inject(PaymentSheetService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      createPaymentSheetTableEnhancedConfig()
    );
    this.searchFilterConfig = SEARCH_FILTER_PAYMENT_SHEET_FORM_CONFIG;
  }

  protected getPendingAmount(row: IPaymentSheet): number {
    return Math.max(0, row.totalCurrentAmount - row.totalPaidAmount);
  }

  protected isFullyPaid(row: IPaymentSheet): boolean {
    return row.totalCurrentAmount > 0 && this.getPendingAmount(row) <= 0;
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadPaymentSheetList();
  }

  protected handlePaymentSheetTableActionClick(
    event: ITableActionClickEvent<IPaymentSheet>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW && selectedRow?.id) {
      void this.routerNavigationService.navigateToRoute([
        ROUTE_BASE_PATHS.PAYMENT_HUB,
        ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEETS,
        selectedRow.id,
      ]);
    }
  }

  private loadPaymentSheetList(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.paymentSheetService
      .getPaymentSheetList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPaymentSheetGetResponseDto) => {
          const { records, totalRecords } = response;
          const mappedData = this.mapTableData(records);

          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction(
            'Payment sheet records loaded successfully'
          );
        },
        error: error => {
          this.table.setData([]);
          this.table.updateTableConfig({ totalRecords: 0 });
          this.logger.logUserAction('Failed to load payment sheets', error);
        },
      });
  }

  private prepareParamData(): IPaymentSheetGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IPaymentSheetGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    records: IPaymentSheetGetBaseResponseDto[]
  ): IPaymentSheet[] {
    return records.map(record => ({
      ...record,
      title: record.title?.trim() ?? '—',
      status: getMappedValueFromArrayOfObjects(
        this.appConfigurationService.paymentSheetStatuses(),
        record.status
      ),
      currentStage: record.currentStage
        ? getMappedValueFromArrayOfObjects(
            this.appConfigurationService.paymentSheetStages(),
            record.currentStage
          )
        : '—',
      originalRawData: record,
    }));
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Payment Sheets',
      subtitle: 'View and track payment sheet batches',
      showHeaderButton: false,
      showGoBackButton: false,
    };
  }
}
