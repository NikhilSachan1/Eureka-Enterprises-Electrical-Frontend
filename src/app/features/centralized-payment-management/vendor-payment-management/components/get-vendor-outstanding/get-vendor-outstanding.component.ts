import { CurrencyPipe } from '@angular/common';
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
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
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
import { createVendorOutstandingTableEnhancedConfig } from '../../config';
import { VendorOutstandingService } from '../../services/vendor-outstanding.service';
import {
  IVendorOutstandingGetBaseResponseDto,
  IVendorOutstandingGetFormDto,
  IVendorOutstandingGetResponseDto,
  IVendorOutstandingGetStatsResponseDto,
} from '../../types/vendor-outstanding.dto';
import {
  IVendorBookPaymentTableRow,
  IVendorOutstandingVendorGroup,
} from '../../types/vendor-outstanding.interface';
import { buildVendorOutstandingInvoiceAmountSegments } from '../../utils/vendor-book-payment-amount.util';

@Component({
  selector: 'app-get-vendor-outstanding',
  imports: [
    PaymentOutstandingSectionComponent,
    DataTableComponent,
    EmptyMessagesComponent,
    PaginatorComponent,
    DocReferenceComponent,
    DocAmountComponent,
    CurrencyPipe,
  ],
  templateUrl: './get-vendor-outstanding.component.html',
  styleUrl: './get-vendor-outstanding.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVendorOutstandingComponent implements OnInit {
  protected readonly EPaymentOutstandingSourceType =
    EPaymentOutstandingSourceType;
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly listEmptyState = {
    icon: ICONS.COMMON.INBOX,
    title: 'No vendor outstanding records found.',
    description: 'There are no pending vendor payments to show.',
  };

  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly vendorOutstandingService = inject(VendorOutstandingService);

  protected table!: IEnhancedTable;
  protected readonly vendorGroups = signal<IVendorOutstandingVendorGroup[]>([]);
  protected readonly summary =
    signal<IVendorOutstandingGetStatsResponseDto | null>(null);
  protected readonly totalRecords = signal(0);
  protected readonly searchTerm = signal('');
  protected readonly paginationFirst = signal(0);
  protected readonly paginationRows = signal(
    APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
  );

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      createVendorOutstandingTableEnhancedConfig()
    );
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

  protected vendorInvoiceAmountSegments(
    row: IVendorBookPaymentTableRow
  ): IDocAmountSegment[] {
    return buildVendorOutstandingInvoiceAmountSegments(
      row.originalRawData.invoice
    );
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
          const groups = records.map(record => this.mapVendorGroup(record));

          this.vendorGroups.set(groups);
          this.table.updateTableConfig({ totalRecords });
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
    const bookPaymentTable = this.dataTableService.createTable(
      createVendorOutstandingTableEnhancedConfig()
    );

    bookPaymentTable.setData(this.mapBookPaymentRows(bookPayments));

    return {
      id: vendor.id,
      vendorName: vendor.name,
      location: [vendor.city, vendor.state].filter(Boolean).join(', '),
      vendorSummary,
      bookPaymentTable,
      originalRawData: record,
    };
  }

  private mapBookPaymentRows(
    bookPayments: IVendorOutstandingGetBaseResponseDto['bookPayments']
  ): IVendorBookPaymentTableRow[] {
    return bookPayments.map(bookPayment => ({
      id: bookPayment.id,
      invoiceNumber: bookPayment.invoice.invoiceNumber,
      invoiceDate: bookPayment.invoice.invoiceDate,
      documentReferenceHierarchy:
        DocReferenceHierarchy.forInvoiceOrJmcParentRow({
          poNumber: bookPayment.po?.poNumber,
          jmcNumber: bookPayment.jmc?.jmcNumber,
        }),
      bookingDate: bookPayment.bookingDate,
      pendingAmount: bookPayment.paymentTotalAmount,
      transactionType:
        bookPayment.paymentTotalAmount > 0
          ? 'debit'
          : bookPayment.paymentTotalAmount < 0
            ? 'credit'
            : undefined,
      originalRawData: bookPayment,
    }));
  }
}
