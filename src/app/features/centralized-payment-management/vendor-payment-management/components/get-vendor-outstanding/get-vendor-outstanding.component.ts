import {
  CurrencyPipe,
  DatePipe,
  NgClass,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { ICONS } from '@shared/constants';
import { TableService } from '@shared/services';
import { IEnhancedTable } from '@shared/types';
import { PaginatorState } from 'primeng/paginator';
import { finalize } from 'rxjs';
import { PaymentOutstandingSectionComponent } from '../../../shared/components/payment-outstanding-section/payment-outstanding-section.component';
import { EPaymentOutstandingSourceType } from '../../../shared/config/payment-outstanding-source-section.config';
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
  IVendorInvoiceOutstandingGroup,
  IVendorOutstandingInvoiceViewType,
  IVendorOutstandingUnbookedInvoice,
  IVendorOutstandingVendorGroup,
} from '../../types/vendor-outstanding.interface';
import {
  buildVendorOutstandingInvoiceAmountSegments,
  mapVendorOutstandingUnbookedInvoiceToSummary,
} from '../../utils/vendor-book-payment-amount.util';

type IVendorOutstandingBookPayment =
  IVendorOutstandingGetBaseResponseDto['bookPayments'][number];

@Component({
  selector: 'app-get-vendor-outstanding',
  imports: [
    PaymentOutstandingSectionComponent,
    DataTableComponent,
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
  excludedBookPaymentIds = input<ReadonlySet<string>>(new Set());

  protected readonly EPaymentOutstandingSourceType =
    EPaymentOutstandingSourceType;
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly icons = ICONS;

  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vendorOutstandingService = inject(VendorOutstandingService);

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

  protected readonly sectionTotalBookPayments = computed(() => {
    const fromSummary = this.summary()?.totalBookPayments;
    if (fromSummary !== null && fromSummary !== undefined) {
      return fromSummary;
    }

    return this.vendorGroups().reduce(
      (total, group) => total + this.vendorBookPaymentsCount(group),
      0
    );
  });

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
      invoice.siteName || invoice.siteLocation || invoice.companyName
    );
  }

  protected uniqueInvoiceCount(group: IVendorOutstandingVendorGroup): number {
    return new Set(group.invoiceGroups.map(invoice => invoice.invoiceId)).size;
  }

  protected vendorBookPaymentsCount(
    group: IVendorOutstandingVendorGroup
  ): number {
    return group.vendorSummary.totalBookPayments ?? this.totalBookings(group);
  }

  protected totalBookings(group: IVendorOutstandingVendorGroup): number {
    return group.invoiceGroups.reduce(
      (total, invoice) =>
        invoice.viewType === 'booked'
          ? total + invoice.bookPayments.length
          : total,
      0
    );
  }

  protected invoiceViewLabel(
    viewType: IVendorOutstandingInvoiceViewType
  ): string {
    return viewType === 'booked' ? 'Booked' : 'Unbooked';
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
      'pending to book': 'pending',
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
          this.logger.logUserAction('Vendor outstanding records loaded');
        },
        error: error => {
          this.vendorGroups.set([]);
          this.summary.set(null);
          this.totalRecords.set(0);
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
      if (!bookedInvoiceIds.has(unbookedInvoice.id)) {
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
      companyName: unbookedInvoice.company?.name ?? '',
      siteName: unbookedInvoice.site?.name ?? '',
      siteLocation: [unbookedInvoice.site?.city, unbookedInvoice.site?.state]
        .filter(Boolean)
        .join(', '),
      invoice: mapVendorOutstandingUnbookedInvoiceToSummary(unbookedInvoice),
      documentReferenceHierarchy:
        DocReferenceHierarchy.forInvoiceOrJmcParentRow({
          poNumber: unbookedInvoice.po?.poNumber,
          jmcNumber: unbookedInvoice.jmc?.jmcNumber,
        }),
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
          companyName: bookPayment.company?.name ?? '',
          siteName: bookPayment.site?.name ?? '',
          siteLocation: [bookPayment.site?.city, bookPayment.site?.state]
            .filter(Boolean)
            .join(', '),
          invoice: bookPayment.invoice,
          documentReferenceHierarchy:
            DocReferenceHierarchy.forInvoiceOrJmcParentRow({
              poNumber: bookPayment.po?.poNumber,
              jmcNumber: bookPayment.jmc?.jmcNumber,
            }),
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
}
