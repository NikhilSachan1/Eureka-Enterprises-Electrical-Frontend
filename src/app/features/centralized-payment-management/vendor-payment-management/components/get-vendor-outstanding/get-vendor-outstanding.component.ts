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
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
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
  IVendorOutstandingVendorGroup,
} from '../../types/vendor-outstanding.interface';
import { buildVendorOutstandingInvoiceAmountSegments } from '../../utils/vendor-book-payment-amount.util';

type IVendorOutstandingBookPayment =
  IVendorOutstandingGetBaseResponseDto['bookPayments'][number];

@Component({
  selector: 'app-get-vendor-outstanding',
  imports: [
    PaymentOutstandingSectionComponent,
    DataTableComponent,
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
  protected readonly emptyBookPaymentsTable = this.createBookPaymentsTable();

  ngOnInit(): void {
    this.loadVendorOutstandingList();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.paginationFirst.set(0);
    this.loadVendorOutstandingList();
  }

  protected onPageChange(event: PaginatorState): void {
    this.paginationFirst.set(event.first ?? 0);
    this.paginationRows.set(
      event.rows ?? APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
    );
    this.loadVendorOutstandingList();
  }

  protected hasInvoiceSiteContext(
    invoice: IVendorInvoiceOutstandingGroup
  ): boolean {
    return Boolean(
      invoice.siteName || invoice.siteLocation || invoice.companyName
    );
  }

  protected paymentCountLabel(count: number): string {
    return count === 1 ? '1 booking' : `${count} bookings`;
  }

  protected totalBookings(group: IVendorOutstandingVendorGroup): number {
    return group.invoiceGroups.reduce(
      (total, invoice) => total + invoice.bookPayments.length,
      0
    );
  }

  protected invoiceAmountSegments(
    invoice: IVendorInvoiceOutstandingGroup
  ): IDocAmountSegment[] {
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
          const groups = records.map(record => this.mapVendorGroup(record));

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
    const { vendor, vendorSummary, bookPayments } = record;
    const invoiceGroups = this.buildVendorInvoiceGroups(bookPayments).map(
      group => ({
        ...group,
        opsTable: this.createBookPaymentsTable(group.bookPayments),
      })
    );

    return {
      id: vendor.id,
      vendorName: vendor.name,
      location: [vendor.city, vendor.state].filter(Boolean).join(', '),
      vendorSummary,
      invoiceGroups,
    };
  }

  private createBookPaymentsTable(
    bookPayments: IVendorBookPaymentTableRow[] = []
  ): IEnhancedTable {
    const opsTable = this.dataTableService.createTable(
      createVendorOutstandingTableEnhancedConfig()
    );

    opsTable.setData(bookPayments);

    return opsTable;
  }

  private buildVendorInvoiceGroups(
    bookPayments: IVendorOutstandingBookPayment[]
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

      group.bookPayments.push(this.mapBookPaymentRow(bookPayment));
    }

    return Array.from(grouped.values());
  }

  private mapBookPaymentRow(
    bookPayment: IVendorOutstandingBookPayment
  ): IVendorBookPaymentTableRow {
    return {
      id: bookPayment.id,
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
}
