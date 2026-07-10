import {
  CurrencyPipe,
  DatePipe,
  NgClass,
  NgTemplateOutlet,
} from '@angular/common';
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
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { LoggerService } from '@core/services';
import { AppPermissionService } from '@core/services/app-permission.service';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import { BOOK_PAYMENT_ACTION_CONFIG_MAP } from '@features/site-management/doc-management/sub-features/book-payment-management/config';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { ICONS } from '@shared/constants';
import { TableService, ConfirmationDialogService } from '@shared/services';
import {
  EButtonActionType,
  IEnhancedTable,
  IButtonConfig,
} from '@shared/types';
import { PaginatorState } from 'primeng/paginator';
import { finalize } from 'rxjs';
import { PaymentOutstandingSectionComponent } from '../../../shared/components/payment-outstanding-section/payment-outstanding-section.component';
import { createVendorOutstandingTableEnhancedConfig } from '../../config/table/get-vendor-outstanding.config';
import { VendorOutstandingService } from '../../services/vendor-outstanding.service';
import {
  IVendorOutstandingGetBaseResponseDto,
  IVendorOutstandingGetFormDto,
  IVendorOutstandingGetResponseDto,
  IVendorOutstandingGetStatsResponseDto,
} from '../../types/vendor-outstanding.dto';
import {
  IVendorBookPaymentTableRow,
  IVendorCardSummaryStat,
  IVendorInvoiceOutstandingGroup,
  IVendorOutstandingInvoiceViewType,
  IVendorOutstandingUnbookedInvoice,
  IVendorOutstandingVendorGroup,
} from '../../types/vendor-outstanding.interface';
import {
  buildVendorOutstandingInvoiceAmountSegments,
  mapVendorOutstandingUnbookedInvoiceToSummary,
} from '../../utils/vendor-book-payment-amount.util';
import type { IOutstandingBalanceSectionSnapshot } from '@features/centralized-payment-management/outstanding-balance-management/types/outstanding-balance-summary.interface';

type IVendorOutstandingBookPayment =
  IVendorOutstandingGetBaseResponseDto['bookPayments'][number];

@Component({
  selector: 'app-get-vendor-outstanding',
  imports: [
    PaymentOutstandingSectionComponent,
    DataTableComponent,
    ButtonComponent,
    EmptyMessagesComponent,
    PaginatorComponent,
    DocReferenceComponent,
    CurrencyPipe,
    DatePipe,
    NgClass,
    NgTemplateOutlet,
  ],
  templateUrl: './get-vendor-outstanding.component.html',
  styleUrl: './get-vendor-outstanding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVendorOutstandingComponent implements OnInit {
  selectionChange = output<IVendorBookPaymentTableRow[]>();
  sectionSummaryChange = output<IOutstandingBalanceSectionSnapshot>();
  excludedBookPaymentIds = input<ReadonlySet<string>>(new Set());
  showSelection = input(true);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly icons = ICONS;
  protected readonly bookPaymentButtonConfig: Partial<IButtonConfig> = {
    ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
    label: 'Book Payment',
    actionName: 'bookPayment',
    permission: [APP_PERMISSION.BOOK_PAYMENT_DOC.ADD],
  };

  private readonly logger = inject(LoggerService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vendorOutstandingService = inject(VendorOutstandingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly loading = signal(false);
  protected readonly vendorGroups = signal<IVendorOutstandingVendorGroup[]>([]);
  protected readonly summary =
    signal<IVendorOutstandingGetStatsResponseDto | null>(null);
  protected readonly totalRecords = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly paginationFirst = signal(0);
  protected readonly paginationRows = signal(
    APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
  );
  private readonly selectionsByTableId = signal<
    Record<string, IVendorBookPaymentTableRow[]>
  >({});

  private readonly invoiceBreakdownLabels = new Set([
    'Taxable',
    'TDS',
    'GST',
    'Total',
  ]);

  private readonly invoicePaymentLabels = new Set([
    'Net payable',
    'Booked',
    'To be booked',
    'Paid',
  ]);

  ngOnInit(): void {
    this.loadVendorOutstandingList();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.paginationFirst.set(0);
    this.clearSelections();
    this.loadVendorOutstandingList();
  }

  protected onPageChange(event: PaginatorState): void {
    this.paginationFirst.set(event.first ?? 0);
    this.paginationRows.set(
      event.rows ?? APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
    );
    this.clearSelections();
    this.loadVendorOutstandingList();
  }

  protected onBookPaymentSelectionChange(
    tableId: string,
    table: IEnhancedTable,
    selectedRows: Record<string, unknown>[]
  ): void {
    const selectedIds = new Set(
      selectedRows
        .map(row => String(row['id'] ?? ''))
        .filter(id => id.length > 0)
    );
    const mappedRows = (table.data() as IVendorBookPaymentTableRow[]).filter(
      row => selectedIds.has(row.id)
    );

    this.selectionsByTableId.update(current => ({
      ...current,
      [tableId]: mappedRows,
    }));
    this.emitCombinedSelection();
  }

  protected hasInvoiceSiteContext(
    invoice: IVendorInvoiceOutstandingGroup
  ): boolean {
    return Boolean(
      invoice.site.name ||
        invoice.site.city ||
        invoice.site.state ||
        invoice.company.name
    );
  }

  protected invoiceDocumentReference(
    invoice: IVendorInvoiceOutstandingGroup
  ): ReturnType<typeof DocReferenceHierarchy.forInvoiceOrJmcParentRow> {
    return DocReferenceHierarchy.forInvoiceOrJmcParentRow({
      poNumber: invoice.po.poNumber,
      jmcNumber: invoice.jmc.jmcNumber,
    });
  }

  protected siteLocation(site: IVendorInvoiceOutstandingGroup['site']): string {
    return [site.city, site.state].filter(Boolean).join(', ');
  }

  protected canBookPaymentForInvoice(
    invoice: IVendorInvoiceOutstandingGroup
  ): boolean {
    if (
      !this.appPermissionService.hasPermission(
        APP_PERMISSION.BOOK_PAYMENT_DOC.ADD
      )
    ) {
      return false;
    }

    return (
      this.resolveInvoiceSiteId(invoice).length > 0 &&
      Number(invoice.invoice?.pendingToBook ?? 0) > 0
    );
  }

  protected vendorOverviewStats(
    group: IVendorOutstandingVendorGroup
  ): IVendorCardSummaryStat[] {
    const invoiceCount = new Set(
      group.invoiceGroups.map(invoice => invoice.invoiceId)
    ).size;
    const bookingCount = group.invoiceGroups
      .filter(invoice => invoice.viewType === 'booked')
      .reduce((total, invoice) => total + invoice.bookPayments.length, 0);

    return [
      {
        kind: 'count',
        value: invoiceCount,
        label: this.pluralizeStatLabel(invoiceCount, 'Invoice', 'Invoices'),
      },
      {
        kind: 'count',
        value: bookingCount,
        label: this.pluralizeStatLabel(bookingCount, 'Booking'),
      },
    ];
  }

  protected vendorPayableStats(
    group: IVendorOutstandingVendorGroup
  ): IVendorCardSummaryStat[] {
    const toBeBooked = group.invoiceGroups.reduce(
      (total, invoice) => total + Number(invoice.invoice?.pendingToBook ?? 0),
      0
    );
    const bookedPayable = group.invoiceGroups
      .filter(invoice => invoice.viewType === 'booked')
      .flatMap(invoice => invoice.bookPayments)
      .reduce(
        (total, bookPayment) => total + Number(bookPayment.pendingAmount ?? 0),
        0
      );

    return [
      {
        kind: 'currency',
        value: toBeBooked,
        label: 'To be booked',
        showToBook: toBeBooked > 0,
      },
      {
        kind: 'currency',
        value: bookedPayable,
        label: 'Booked',
        showDebit: bookedPayable > 0,
      },
    ];
  }

  protected invoiceAmountSectionGroups(
    invoice: IVendorInvoiceOutstandingGroup
  ): { title: string; segments: IDocAmountSegment[] }[] {
    const segments = this.invoiceAmountSegments(invoice);

    return [
      {
        title: 'Invoice breakdown',
        segments: segments.filter(segment =>
          this.invoiceBreakdownLabels.has(segment.label)
        ),
      },
      {
        title: 'Booking & payment',
        segments: segments.filter(segment =>
          this.invoicePaymentLabels.has(segment.label)
        ),
      },
    ].filter(section => section.segments.length > 0);
  }

  protected openBookPaymentDialog(
    invoice: IVendorInvoiceOutstandingGroup
  ): void {
    if (!this.canBookPaymentForInvoice(invoice)) {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.ADD,
      BOOK_PAYMENT_ACTION_CONFIG_MAP[EButtonActionType.ADD],
      null,
      false,
      false,
      {
        docContext: EDocContext.PURCHASE,
        projectName: this.resolveInvoiceSiteId(invoice),
        invoiceId: invoice.invoiceId,
        presetPaymentAmount: Number(invoice.invoice?.pendingToBook ?? 0),
        presetBookingDateToday: true,
        onSuccess: () => this.loadVendorOutstandingList(),
      }
    );
  }

  protected invoiceAmountSegments(
    invoice: IVendorInvoiceOutstandingGroup
  ): IDocAmountSegment[] {
    if (!invoice.invoice) {
      return [];
    }

    return buildVendorOutstandingInvoiceAmountSegments(invoice.invoice);
  }

  protected metricTone(label: string): string {
    const key = label.trim().toLowerCase();
    const tones: Record<string, string> = {
      taxable: 'taxable',
      tds: 'deduction',
      gst: 'gst',
      total: 'total',
      'net payable': 'net',
      booked: 'booked',
      paid: 'paid',
      'to be booked': 'to-book',
    };

    return tones[key] ?? 'neutral';
  }

  protected isPositiveAmount(segment: IDocAmountSegment): boolean {
    return this.hasSegmentValue(segment) && Number(segment.value) > 0;
  }

  protected hasSegmentValue(segment: IDocAmountSegment): boolean {
    return (
      segment.value !== null &&
      segment.value !== undefined &&
      segment.value !== ''
    );
  }

  protected amountMetricGridColumn(
    sectionIndex: number,
    metricIndex: number
  ): number {
    return sectionIndex * 2 + (metricIndex % 2) + 1;
  }

  protected amountMetricGridRow(metricIndex: number): number {
    return Math.floor(metricIndex / 2) + 2;
  }

  private loadVendorOutstandingList(): void {
    this.loading.set(true);
    const paramData = this.prepareParamData();

    this.vendorOutstandingService
      .getVendorOutstandingList(paramData)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVendorOutstandingGetResponseDto) => {
          const { records, summary, totalRecords } = response;
          const groups = records
            .map(record => this.mapVendorGroup(record))
            .filter(group => group.invoiceGroups.length > 0);

          this.clearSelections();
          this.vendorGroups.set(groups);
          this.summary.set(summary ?? null);
          this.totalRecords.set(totalRecords);
          this.emitSectionSummary(totalRecords, summary ?? null);
          this.logger.logUserAction('Vendor outstanding records loaded');
        },
        error: error => {
          this.vendorGroups.set([]);
          this.summary.set(null);
          this.totalRecords.set(0);
          this.emitSectionSummary(0, null);
          this.logger.logUserAction('Failed to load vendor outstanding', error);
        },
      });
  }

  private prepareParamData(): IVendorOutstandingGetFormDto {
    const rows = this.paginationRows();
    const first = this.paginationFirst();

    return {
      page: Math.floor(first / rows) + 1,
      pageSize: rows,
      ...(this.searchTerm() ? { search: this.searchTerm() } : {}),
    };
  }

  private mapVendorGroup(
    record: IVendorOutstandingGetBaseResponseDto
  ): IVendorOutstandingVendorGroup {
    const { vendor, vendorSummary, bookPayments, unbookedInvoices } = record;
    const excludedBookPaymentIds = this.excludedBookPaymentIds();
    const bookedGroups = this.buildVendorInvoiceGroups(bookPayments, vendor.id);
    const invoiceGroups = this.buildVendorOutstandingInvoiceViews(
      bookedGroups,
      unbookedInvoices,
      excludedBookPaymentIds
    );

    return {
      id: vendor.id,
      vendorName: vendor.name,
      location: [vendor.city, vendor.state].filter(Boolean).join(', '),
      vendorSummary,
      invoiceGroups,
    };
  }

  private buildVendorOutstandingInvoiceViews(
    bookedGroups: Omit<IVendorInvoiceOutstandingGroup, 'opsTable'>[],
    unbookedInvoices: IVendorOutstandingUnbookedInvoice[],
    excludedBookPaymentIds: ReadonlySet<string>
  ): IVendorInvoiceOutstandingGroup[] {
    const invoiceViews: IVendorInvoiceOutstandingGroup[] = [];
    const bookedInvoiceIds = new Set<string>();

    for (const group of bookedGroups) {
      bookedInvoiceIds.add(group.invoiceId);
      const hasBookedData =
        group.bookPayments.length > 0 ||
        Number(group.invoice?.bookedTotal ?? 0) > 0;
      const pendingToBook = Number(group.invoice?.pendingToBook ?? 0);

      if (hasBookedData) {
        invoiceViews.push(
          this.toInvoiceOutstandingView(group, 'booked', excludedBookPaymentIds)
        );
      }

      if (pendingToBook > 0) {
        invoiceViews.push(
          this.toInvoiceOutstandingView(
            group,
            'unbooked',
            excludedBookPaymentIds
          )
        );
      }
    }

    for (const unbookedInvoice of unbookedInvoices) {
      if (
        !bookedInvoiceIds.has(unbookedInvoice.id) &&
        Number(unbookedInvoice.pendingToBook ?? 0) > 0
      ) {
        invoiceViews.push(
          this.toUnbookedOnlyInvoiceView(
            unbookedInvoice,
            excludedBookPaymentIds
          )
        );
      }
    }

    return invoiceViews;
  }

  private toInvoiceOutstandingView(
    group: Omit<IVendorInvoiceOutstandingGroup, 'opsTable'>,
    viewType: IVendorOutstandingInvoiceViewType,
    excludedBookPaymentIds: ReadonlySet<string>
  ): IVendorInvoiceOutstandingGroup {
    const bookPayments = viewType === 'booked' ? group.bookPayments : [];

    return {
      ...group,
      id: `${group.invoiceId}-${viewType}`,
      viewType,
      bookPayments,
      opsTable: this.createBookPaymentsTable(
        bookPayments,
        excludedBookPaymentIds
      ),
    };
  }

  private toUnbookedOnlyInvoiceView(
    unbookedInvoice: IVendorOutstandingUnbookedInvoice,
    excludedBookPaymentIds: ReadonlySet<string>
  ): IVendorInvoiceOutstandingGroup {
    return {
      id: `${unbookedInvoice.id}-unbooked`,
      invoiceId: unbookedInvoice.id,
      viewType: 'unbooked',
      invoiceNumber: unbookedInvoice.invoiceNumber,
      invoiceDate: unbookedInvoice.invoiceDate,
      site: unbookedInvoice.site,
      company: unbookedInvoice.company,
      po: unbookedInvoice.po,
      jmc: unbookedInvoice.jmc,
      invoice: mapVendorOutstandingUnbookedInvoiceToSummary(unbookedInvoice),
      bookPayments: [],
      opsTable: this.createBookPaymentsTable([], excludedBookPaymentIds),
    };
  }

  private createBookPaymentsTable(
    bookPayments: IVendorBookPaymentTableRow[] = [],
    excludedBookPaymentIds: ReadonlySet<string> = new Set()
  ): IEnhancedTable {
    const opsTable = this.dataTableService.createTable(
      createVendorOutstandingTableEnhancedConfig()
    );

    opsTable.updateTableConfig({
      showCheckbox: this.showSelection(),
      disableRowSelectionWhen: row => {
        const bookPaymentId = String(row['id'] ?? '');

        if (bookPaymentId && excludedBookPaymentIds.has(bookPaymentId)) {
          return true;
        }

        return Number(row['paymentTotalAmount'] ?? 0) <= 0;
      },
    });
    opsTable.setData(bookPayments);

    return opsTable;
  }

  private buildVendorInvoiceGroups(
    bookPayments: IVendorOutstandingBookPayment[],
    vendorId: string
  ): Omit<IVendorInvoiceOutstandingGroup, 'opsTable'>[] {
    const grouped = new Map<
      string,
      Omit<IVendorInvoiceOutstandingGroup, 'opsTable'>
    >();

    for (const bookPayment of bookPayments) {
      const invoiceId = bookPayment.invoice.id;
      let group = grouped.get(invoiceId);

      if (!group) {
        group = {
          id: invoiceId,
          invoiceId,
          viewType: 'booked',
          invoiceNumber: bookPayment.invoice.invoiceNumber,
          invoiceDate: bookPayment.invoice.invoiceDate,
          site: bookPayment.site,
          company: bookPayment.company,
          po: bookPayment.po,
          jmc: bookPayment.jmc,
          invoice: bookPayment.invoice,
          bookPayments: [],
        };
        grouped.set(invoiceId, group);
      }

      group.bookPayments.push(this.mapBookPaymentRow(bookPayment, vendorId));
    }

    return Array.from(grouped.values());
  }

  private mapBookPaymentRow(
    bookPayment: IVendorOutstandingBookPayment,
    vendorId: string
  ): IVendorBookPaymentTableRow {
    return {
      id: bookPayment.id,
      vendorId,
      bookingDate: bookPayment.bookingDate,
      pendingAmount: bookPayment.paymentTotalAmount,
      transactionType:
        bookPayment.paymentTotalAmount > 0
          ? 'debit'
          : bookPayment.paymentTotalAmount < 0
            ? 'credit'
            : undefined,
      originalRawData: bookPayment,
    };
  }

  private emitCombinedSelection(): void {
    const selectedBookPayments = Object.values(
      this.selectionsByTableId()
    ).flat();

    this.selectionChange.emit(selectedBookPayments);
  }

  private clearSelections(): void {
    this.selectionsByTableId.set({});
    this.selectionChange.emit([]);
  }

  private resolveInvoiceSiteId(
    invoice: IVendorInvoiceOutstandingGroup
  ): string {
    return (
      invoice.site.id ??
      invoice.bookPayments.find(row => row.originalRawData.site.id)
        ?.originalRawData.site.id ??
      ''
    );
  }

  private pluralizeStatLabel(
    count: number,
    singular: string,
    plural = `${singular}s`
  ): string {
    return count === 1 ? singular : plural;
  }

  private emitSectionSummary(
    totalRecords: number,
    summary: IVendorOutstandingGetStatsResponseDto | null
  ): void {
    this.sectionSummaryChange.emit({
      totalRecords,
      totalPendingToBook: summary?.totalPendingToBook ?? 0,
      totalNetPayableAmount: summary?.totalNetPayableAmount ?? 0,
    });
  }
}
