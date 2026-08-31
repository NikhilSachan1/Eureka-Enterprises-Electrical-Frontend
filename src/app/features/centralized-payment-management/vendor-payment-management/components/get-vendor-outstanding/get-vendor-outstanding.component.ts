import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { LoggerService } from '@core/services';
import { AppPermissionService } from '@core/services/app-permission.service';
import type { IOutstandingBalanceSectionSnapshot } from '@features/centralized-payment-management/outstanding-balance-management/types/outstanding-balance-summary.interface';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import { BOOK_PAYMENT_ACTION_CONFIG_MAP } from '@features/site-management/doc-management/sub-features/book-payment-management/config';
import { buildInvoiceTaxGstAmountSegments } from '@features/site-management/doc-management/sub-features/invoice-management/utils/invoice-table-row.util';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ICONS } from '@shared/constants';
import {
  ConfirmationDialogService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  IEnhancedTable,
  ITableActionClickEvent,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { PaymentOutstandingSectionComponent } from '../../../shared/components/payment-outstanding-section/payment-outstanding-section.component';
import {
  VENDOR_OUTSTANDING_BOOKINGS_TABLE_ENHANCED_CONFIG,
  VENDOR_OUTSTANDING_INVOICE_TABLE_ENHANCED_CONFIG,
  VENDOR_OUTSTANDING_VENDOR_TABLE_ENHANCED_CONFIG,
} from '../../config/table/get-vendor-outstanding.config';
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
  IVendorOutstandingInvoiceListRow,
  IVendorOutstandingUnbookedInvoice,
  IVendorOutstandingVendorGroup,
  IVendorOutstandingVendorTableRow,
} from '../../types/vendor-outstanding.interface';
import { mapVendorOutstandingUnbookedInvoiceToSummary } from '../../utils/vendor-book-payment-amount.util';

type IVendorOutstandingBookPayment =
  IVendorOutstandingGetBaseResponseDto['bookPayments'][number];

@Component({
  selector: 'app-get-vendor-outstanding',
  imports: [
    PaymentOutstandingSectionComponent,
    DataTableComponent,
    DocAmountComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
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

  private readonly logger = inject(LoggerService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly vendorOutstandingService = inject(VendorOutstandingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected vendorTable!: IEnhancedTable;
  protected invoiceTable!: IEnhancedTable;
  protected bookingsTable!: IEnhancedTable;

  protected readonly vendorGroups = signal<IVendorOutstandingVendorGroup[]>([]);
  protected readonly searchTerm = signal('');
  protected tableFilterData!: TableLazyLoadEvent;
  private readonly selectionsByInvoiceId = signal<
    Record<string, IVendorBookPaymentTableRow[]>
  >({});
  private readonly bookingsSelectionReady = new Set<string>();

  protected readonly icons = ICONS;

  protected readonly hasInvoiceRows = (
    row: Record<string, unknown>
  ): boolean => {
    const invoiceRows = row['invoiceRows'];
    return Array.isArray(invoiceRows) && invoiceRows.length > 0;
  };

  constructor() {
    effect(() => {
      this.excludedBookPaymentIds();
      this.showSelection();
      untracked(() => this.syncBookingsSelectionRules());
    });
  }

  ngOnInit(): void {
    this.vendorTable = this.dataTableService.createTable(
      VENDOR_OUTSTANDING_VENDOR_TABLE_ENHANCED_CONFIG
    );
    this.invoiceTable = this.dataTableService.createTable(
      VENDOR_OUTSTANDING_INVOICE_TABLE_ENHANCED_CONFIG
    );
    this.bookingsTable = this.dataTableService.createTable(
      VENDOR_OUTSTANDING_BOOKINGS_TABLE_ENHANCED_CONFIG
    );
    this.syncBookingsSelectionRules();
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadVendorOutstandingList();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    if (!this.tableFilterData) {
      return;
    }

    this.tableFilterData = { ...this.tableFilterData, first: 0 };
    this.clearSelections();
    this.loadVendorOutstandingList();
  }

  protected onInvoiceRowAction(event: ITableActionClickEvent): void {
    if (event.actionType !== EButtonActionType.ADD) {
      return;
    }

    const invoice = this.findInvoice(String(event.selectedRows[0]?.['id'] ?? ''));

    if (invoice) {
      this.openBookPaymentDialog(invoice);
    }
  }

  protected onBookPaymentSelectionChange(
    invoiceId: string,
    selectedRows: Record<string, unknown>[]
  ): void {
    if (!this.bookingsSelectionReady.has(invoiceId)) {
      this.bookingsSelectionReady.add(invoiceId);

      if (selectedRows.length === 0) {
        return;
      }
    }

    const selectedIds = new Set(
      selectedRows
        .map(row => String(row['id'] ?? ''))
        .filter(id => id.length > 0)
    );
    const invoice = this.findInvoice(invoiceId);
    const mappedRows = (invoice?.bookPayments ?? []).filter(row =>
      selectedIds.has(row.id)
    );

    this.selectionsByInvoiceId.update(current => ({
      ...current,
      [invoiceId]: mappedRows,
    }));
    this.emitCombinedSelection();
  }

  protected invoiceTaxGstSegments(
    row: IVendorOutstandingInvoiceListRow
  ): IDocAmountSegment[] {
    return [
      ...buildInvoiceTaxGstAmountSegments({
        taxableAmount: this.toAmountString(row.taxableAmount),
        tdsAmount: this.toAmountString(row.tdsAmount),
        tdsPercentage: row.tdsPercentage ?? '',
        gstAmount: this.toAmountString(row.gstAmount),
        gstPercentage: row.gstPercentage ?? '',
        totalAmount: this.toAmountString(row.totalAmount),
        isGstHold: row.isGstHold,
      }),
      {
        dataType: EDataType.CURRENCY,
        label: 'Net payable',
        value: row.netPayableAmount,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'To be booked',
        value: row.pendingToBook,
      },
    ];
  }

  protected vendorAmountSegments(
    row: IVendorOutstandingVendorTableRow
  ): IDocAmountSegment[] {
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'To be booked',
        value: row.toBeBooked,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Booked',
        value: row.bookedAmount,
      },
    ];
  }

  protected invoiceBookedPaidSegments(
    row: IVendorOutstandingInvoiceListRow
  ): IDocAmountSegment[] {
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'Booked',
        value: row.bookedTotal,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Paid',
        value: row.paidTotal,
      },
    ];
  }

  private toAmountString(value: number | null | undefined): string {
    return value === null || value === undefined ? '' : String(value);
  }

  private canBookPaymentForInvoice(
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

  private openBookPaymentDialog(
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

  private findInvoice(
    invoiceId: string
  ): IVendorInvoiceOutstandingGroup | undefined {
    for (const group of this.vendorGroups()) {
      const invoice = group.invoiceGroups.find(item => item.id === invoiceId);

      if (invoice) {
        return invoice;
      }
    }

    return undefined;
  }

  private loadVendorOutstandingList(): void {
    this.vendorTable.setLoading(true);

    this.vendorOutstandingService
      .getVendorOutstandingList(this.prepareParamData())
      .pipe(
        finalize(() => this.vendorTable.setLoading(false)),
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
          this.vendorTable.setData(groups.map(group => this.mapVendorRow(group)));
          this.vendorTable.updateTableConfig({ totalRecords });
          this.emitSectionSummary(totalRecords, summary ?? null);
          this.logger.logUserAction('Vendor outstanding records loaded');
        },
        error: error => {
          this.vendorGroups.set([]);
          this.vendorTable.setData([]);
          this.vendorTable.updateTableConfig({ totalRecords: 0 });
          this.emitSectionSummary(0, null);
          this.logger.logUserAction('Failed to load vendor outstanding', error);
        },
      });
  }

  private prepareParamData(): IVendorOutstandingGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IVendorOutstandingGetFormDto>(
        this.tableFilterData,
        this.vendorTable.getHeaders()
      );

    return {
      ...base,
      ...(this.searchTerm() ? { search: this.searchTerm() } : {}),
    };
  }

  private syncBookingsSelectionRules(): void {
    if (!this.bookingsTable) {
      return;
    }

    const excludedBookPaymentIds = this.excludedBookPaymentIds();

    this.bookingsTable.updateTableConfig({
      showCheckbox: this.showSelection(),
      disableRowSelectionWhen: row => {
        const bookPaymentId = String(row['id'] ?? '');

        if (bookPaymentId && excludedBookPaymentIds.has(bookPaymentId)) {
          return true;
        }

        return Number(row['paymentTotalAmount'] ?? row['pendingAmount'] ?? 0) <= 0;
      },
    });
  }

  private mapVendorRow(
    group: IVendorOutstandingVendorGroup
  ): IVendorOutstandingVendorTableRow {
    return {
      id: group.id,
      vendorName: group.vendorName,
      location: group.location,
      toBeBooked: group.invoiceGroups.reduce(
        (total, invoice) => total + Number(invoice.invoice?.pendingToBook ?? 0),
        0
      ),
      bookedAmount: group.invoiceGroups
        .flatMap(invoice => invoice.bookPayments)
        .reduce(
          (total, bookPayment) => total + Number(bookPayment.pendingAmount ?? 0),
          0
        ),
      invoiceCount: group.invoiceGroups.length,
      bookingCount: group.invoiceGroups.reduce(
        (total, invoice) => total + invoice.bookPayments.length,
        0
      ),
      invoiceRows: group.invoiceGroups.map(invoice =>
        this.mapInvoiceRow(invoice)
      ),
    };
  }

  private mapInvoiceRow(
    invoice: IVendorInvoiceOutstandingGroup
  ): IVendorOutstandingInvoiceListRow {
    const summary = invoice.invoice;

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      docWorkspaceContext: {
        companyName: invoice.company.name,
        projectName: invoice.site.name,
        siteLocationSubtitle: [invoice.site.city, invoice.site.state]
          .filter(Boolean)
          .join(', '),
      },
      documentReferenceHierarchy: DocReferenceHierarchy.forInvoiceOrJmcParentRow(
        {
          poNumber: invoice.po.poNumber,
          jmcNumber: invoice.jmc.jmcNumber,
        }
      ),
      taxableAmount: summary?.taxableAmount ?? null,
      tdsAmount: summary?.tdsAmount ?? null,
      tdsPercentage: summary?.tdsPercentage ?? null,
      gstAmount: summary?.gstAmount ?? null,
      gstPercentage: summary?.gstPercentage ?? null,
      totalAmount: summary?.totalAmount ?? null,
      isGstHold: summary?.isGstHold ?? false,
      netPayableAmount: summary?.netPayableAmount ?? null,
      bookedTotal: summary?.bookedTotal ?? null,
      paidTotal: summary?.paidTotal ?? null,
      pendingToBook: summary?.pendingToBook ?? null,
      bookPayments: invoice.bookPayments,
      canBookPayment: this.canBookPaymentForInvoice(invoice),
    };
  }

  private mapVendorGroup(
    record: IVendorOutstandingGetBaseResponseDto
  ): IVendorOutstandingVendorGroup {
    const { vendor, vendorSummary, bookPayments, unbookedInvoices } = record;
    const bookedGroups = this.buildVendorInvoiceGroups(bookPayments, vendor.id);

    return {
      id: vendor.id,
      vendorName: vendor.name,
      location: [vendor.city, vendor.state].filter(Boolean).join(', '),
      vendorSummary,
      invoiceGroups: this.buildVendorOutstandingInvoiceViews(
        bookedGroups,
        unbookedInvoices
      ),
    };
  }

  private buildVendorOutstandingInvoiceViews(
    bookedGroups: IVendorInvoiceOutstandingGroup[],
    unbookedInvoices: IVendorOutstandingUnbookedInvoice[]
  ): IVendorInvoiceOutstandingGroup[] {
    const invoiceViews: IVendorInvoiceOutstandingGroup[] = [];
    const bookedInvoiceIds = new Set<string>();

    for (const group of bookedGroups) {
      bookedInvoiceIds.add(group.invoiceId);
      const hasBookedData =
        group.bookPayments.length > 0 ||
        Number(group.invoice?.bookedTotal ?? 0) > 0;
      const pendingToBook = Number(group.invoice?.pendingToBook ?? 0);

      if (hasBookedData || pendingToBook > 0) {
        invoiceViews.push({
          ...group,
          id: group.invoiceId,
          viewType: hasBookedData ? 'booked' : 'unbooked',
        });
      }
    }

    for (const unbookedInvoice of unbookedInvoices) {
      if (
        !bookedInvoiceIds.has(unbookedInvoice.id) &&
        Number(unbookedInvoice.pendingToBook ?? 0) > 0
      ) {
        invoiceViews.push(this.toUnbookedOnlyInvoiceView(unbookedInvoice));
      }
    }

    return invoiceViews;
  }

  private toUnbookedOnlyInvoiceView(
    unbookedInvoice: IVendorOutstandingUnbookedInvoice
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
    };
  }

  private buildVendorInvoiceGroups(
    bookPayments: IVendorOutstandingBookPayment[],
    vendorId: string
  ): IVendorInvoiceOutstandingGroup[] {
    const grouped = new Map<string, IVendorInvoiceOutstandingGroup>();

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
    this.selectionChange.emit(
      Object.values(this.selectionsByInvoiceId()).flat()
    );
  }

  private clearSelections(): void {
    this.bookingsSelectionReady.clear();
    this.selectionsByInvoiceId.set({});
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
