import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { APP_CONFIG } from '@core/config';
import { AppPermissionService, LoggerService } from '@core/services';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { InvoiceLedgerSummaryComponent } from '../invoice-ledger-summary/invoice-ledger-summary.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import {
  GalleryService,
  LoadingService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  IEnhancedTable,
  IPageHeaderConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import {
  buildInvoiceLedgerSummaryView,
  createInvoiceLedgerExportButtonConfigs,
  createInvoiceLedgerPageHeaderConfig,
  createInvoiceLedgerSearchFilterConfig,
  INVOICE_LEDGER_EXPORT_LOADING,
  INVOICE_LEDGER_TABLE_BAR,
  createInvoiceLedgerTableEnhancedConfig,
  INVOICE_LEDGER_AMOUNT_TONES,
  INVOICE_LEDGER_SIDE_CONFIG,
} from '../../config';
import { InvoiceLedgerService } from '../../services/invoice-ledger.service';
import {
  IInvoiceLedgerGetFormDto,
  IInvoiceLedgerGetResponseDto,
  IInvoiceLedgerRecordDto,
} from '../../types/invoice-ledger.dto';
import {
  EInvoiceLedgerExportFormat,
  EInvoiceLedgerSide,
} from '../../types/invoice-ledger.enum';
import {
  IInvoiceLedgerSummarySource,
  IInvoiceLedgerTableRow,
} from '../../types/invoice-ledger.interface';
import { buildLedgerTableRow } from '../../utils/invoice-ledger-row.util';
import {
  ledgerExportFileName,
  saveLedgerExport,
} from '../../utils/invoice-ledger-export.util';

/**
 * Invoice-wise ledger for one side — contractor (SALE) or vendor (PURCHASE), picked by the
 * route. The summary covers every invoice matching the filters, not just the visible page.
 */
@Component({
  selector: 'app-get-invoice-ledger',
  imports: [
    PageHeaderComponent,
    SearchFilterComponent,
    ButtonComponent,
    InvoiceLedgerSummaryComponent,
    DataTableComponent,
    DocWorkspaceContextComponent,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './get-invoice-ledger.component.html',
  styleUrl: './get-invoice-ledger.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetInvoiceLedgerComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly dataTableService = inject(TableService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly invoiceLedgerService = inject(InvoiceLedgerService);
  private readonly loadingService = inject(LoadingService);
  private readonly galleryService = inject(GalleryService);
  private readonly appPermissionService = inject(AppPermissionService);

  protected readonly currencyCode = APP_CONFIG.CURRENCY_CONFIG.DEFAULT;
  protected readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;
  protected readonly amountTones = INVOICE_LEDGER_AMOUNT_TONES;
  protected readonly sideConfig =
    INVOICE_LEDGER_SIDE_CONFIG[
      (this.route.snapshot.data['ledgerSide'] as EInvoiceLedgerSide) ??
        EInvoiceLedgerSide.CONTRACTOR
    ];

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected readonly searchFilterConfig: ITableSearchFilterFormConfig =
    createInvoiceLedgerSearchFilterConfig(this.sideConfig);

  private readonly summarySource = signal<IInvoiceLedgerSummarySource | null>(
    null
  );

  /** Charts and headline figures above the table; covers every matching invoice. */
  protected readonly summaryView = computed(() => {
    const source = this.summarySource();
    return source
      ? buildInvoiceLedgerSummaryView(
          source.totals,
          source.insights,
          this.sideConfig
        )
      : null;
  });

  protected readonly tableBar = INVOICE_LEDGER_TABLE_BAR;
  protected readonly pageHeaderConfig: IPageHeaderConfig =
    createInvoiceLedgerPageHeaderConfig(this.sideConfig);

  /** How many invoices the filters match, i.e. what an export will hold; null until loaded. */
  protected readonly matchingCount = computed(
    () => this.summarySource()?.totalRecords ?? null
  );

  /** Export has its own permission per side; without it the export bar is not shown. */
  protected readonly canExport = this.appPermissionService.hasPermission(
    this.sideConfig.exportPermission
  );

  /** PDF and interactive file; offered once the filters match at least one invoice. */
  protected readonly exportButtons = computed(() =>
    createInvoiceLedgerExportButtonConfigs((this.matchingCount() ?? 0) > 0)
  );

  /**
   * Same filters and order as the table, every matching invoice (not just this page). The file
   * comes straight back from the API: the PDF opens in the viewer, the interactive file is saved
   * to downloads.
   */
  protected exportLedger(format: EInvoiceLedgerExportFormat): void {
    this.loadingService.show(INVOICE_LEDGER_EXPORT_LOADING[format]);

    this.invoiceLedgerService
      .exportInvoiceLedger(this.prepareParamData(), format)
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (blob: Blob) => {
          const fileName = ledgerExportFileName(
            this.sideConfig.partyLabel,
            format
          );
          if (format === EInvoiceLedgerExportFormat.INTERACTIVE) {
            saveLedgerExport(blob, fileName);
          } else {
            this.galleryService.show([
              { mediaKey: fileName, actualMediaUrl: URL.createObjectURL(blob) },
            ]);
          }
          this.logger.logUserAction('Invoice ledger exported', {
            side: this.sideConfig.side,
            format,
          });
        },
        error: error => {
          // ApiService already shows the reason (e.g. no invoices, too many to export).
          this.logger.logUserAction('Failed to export invoice ledger', error);
        },
      });
  }

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      createInvoiceLedgerTableEnhancedConfig(this.sideConfig)
    );
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadInvoiceLedger();
  }

  private loadInvoiceLedger(): void {
    this.table.setLoading(true);
    const paramData = this.prepareParamData();

    this.invoiceLedgerService
      .getInvoiceLedger(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IInvoiceLedgerGetResponseDto) => {
          const { records, totals, insights, totalRecords } = response;

          this.table.setData(this.mapTableData(records));
          this.table.updateTableConfig({ totalRecords });
          this.summarySource.set({ totals, insights, totalRecords });
          this.logger.logUserAction('Invoice ledger loaded successfully');
        },
        error: error => {
          this.table.setLoadError();
          this.summarySource.set(null);
          this.logger.logUserAction('Failed to load invoice ledger', error);
        },
      });
  }

  private prepareParamData(): IInvoiceLedgerGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IInvoiceLedgerGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );
    return { ...base, partyType: this.sideConfig.side };
  }

  private mapTableData(
    records: IInvoiceLedgerRecordDto[]
  ): IInvoiceLedgerTableRow[] {
    return records.map(record => buildLedgerTableRow(record, this.sideConfig));
  }
}
