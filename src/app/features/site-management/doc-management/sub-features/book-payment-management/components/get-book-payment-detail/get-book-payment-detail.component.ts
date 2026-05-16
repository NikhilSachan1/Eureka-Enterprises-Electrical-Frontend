import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  IBookPaymentDetailGetResponseDto,
  IBookPaymentGetBaseResponseDto,
} from '../../types/book-payment.dto';
import { BookPaymentService } from '../../services/book-payment.service';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';

@Component({
  selector: 'app-get-book-payment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewDetailComponent, DocReferenceComponent, DocAmountComponent],
  templateUrl: './get-book-payment-detail.component.html',
  styleUrl: './get-book-payment-detail.component.scss',
})
export class GetBookPaymentDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    bookPayment: IBookPaymentGetBaseResponseDto;
  };
  private readonly bookPaymentService = inject(BookPaymentService);
  private readonly loadingService = inject(LoadingService);

  protected readonly _bookPaymentDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;

  override onDrawerShow(): void {
    this.loadBookPaymentDetails();
  }

  private loadBookPaymentDetails(): void {
    this.loadingService.show({
      title: 'Loading details',
      message: 'Fetching book payment…',
    });

    const { id } = this.drawerData.bookPayment;

    this.bookPaymentService
      .getBookPaymentDetailById(id)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IBookPaymentDetailGetResponseDto) => {
          this._bookPaymentDetails.set(this.mapBookPaymentDetailData(response));
          this.logger.logUserAction('Book payment detail loaded');
        },
        error: error => {
          this.logger.error('Failed to load book payment detail', error);
        },
      });
  }

  private mapBookPaymentDetailData(
    record: IBookPaymentDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Company Name',
        value: record.site.company.name,
      },
      {
        label: 'Site Name',
        value: record.site.name,
        suffix: this.buildSiteLocationSuffix(record.site),
      },
      {
        label: 'Booking Date',
        value: record.bookingDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Document reference',
        value: DocReferenceHierarchy.forBookPaymentRow({
          poNumber: record.invoice?.jmc?.po?.poNumber,
          jmcNumber: record.invoice?.jmc?.jmcNumber,
          invoiceNumber: record.invoice?.invoiceNumber,
        }),
        customTemplateKey: 'documentReferenceHierarchy',
        detailTemplateFullRow: false,
      },
      {
        label: 'Payment amounts',
        value: {
          taxableAmount: record.taxableAmount,
          gstAmount: record.gstAmount,
          gstPercentage: `(${record.gstPercentage}%)`,
          tdsDeductionAmount: record.tdsDeductionAmount,
          tdsPercentage: `(${record.tdsPercentage}%)`,
          paymentTotalAmount: record.paymentTotalAmount,
        },
        customTemplateKey: 'bookPaymentDetailAmounts',
        detailTemplateFullRow: true,
      },
      {
        label: 'Bank transfer',
        value: record.hasTransfer === true ? 'Done' : 'Pending',
        type: EDataType.STATUS,
      },
      {
        label: 'Payment Hold Reason',
        value: record.paymentHoldReason ?? '—',
      },
    ];

    const detail: IDataViewDetails = {
      entryData,
      createdBy: {
        user: record.createdByUser,
        date: record.createdAt,
        notes: record.remarks ?? undefined,
      },
      updatedBy: {
        user: record.updatedByUser,
        date: record.updatedAt,
      },
    };

    return {
      details: [detail],
      entity: this.headerFromRecord(record),
    };
  }

  private headerFromRecord(
    record: IBookPaymentDetailGetResponseDto
  ): IEntityViewDetails {
    const { vendor } = record;
    return {
      name: vendor?.name?.trim() || 'Book payment',
      subtitle: record.invoice?.invoiceNumber ?? record.id,
    };
  }

  private buildSiteLocationSuffix(
    site: IBookPaymentDetailGetResponseDto['site'] | null | undefined
  ): string | undefined {
    if (!site) {
      return undefined;
    }
    const parts = [site.city, site.state].filter(
      (part): part is string => !!part && part.trim().length > 0
    );
    return parts.length > 0 ? ` · ${parts.join(', ')}` : undefined;
  }

  /** Mirrors list `docBookPaymentAmountSegments` via {@link DocAmountComponent}. */
  protected docBookPaymentDrawerAmountSegments(v: {
    taxableAmount: string;
    gstAmount: string;
    gstPercentage: string;
    tdsDeductionAmount: string;
    tdsPercentage: string;
    paymentTotalAmount: string;
  }): IDocAmountSegment[] {
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'Taxable',
        value: v.taxableAmount,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'GST',
        value: v.gstAmount,
        suffix: v.gstPercentage,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'TDS',
        value: v.tdsDeductionAmount,
        suffix: v.tdsPercentage,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Total',
        value: v.paymentTotalAmount,
      },
    ];
  }
}
