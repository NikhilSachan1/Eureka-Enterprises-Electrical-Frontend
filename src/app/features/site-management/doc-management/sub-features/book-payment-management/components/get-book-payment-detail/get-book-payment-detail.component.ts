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
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';

import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';

@Component({
  selector: 'app-get-book-payment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ViewDetailComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-book-payment-detail.component.html',
  styleUrl: './get-book-payment-detail.component.scss',
})
export class GetBookPaymentDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    bookPayment: IBookPaymentGetBaseResponseDto;
  };
  private readonly bookPaymentService = inject(BookPaymentService);

  protected readonly _bookPaymentDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;

  override onDrawerShow(): void {
    this.loadBookPaymentDetails();
  }

  private loadBookPaymentDetails(): void {
    this.setDrawerLoading(true);
    const { id } = this.drawerData.bookPayment;

    this.bookPaymentService
      .getBookPaymentDetailById(id)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
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
        label: 'Workspace overview',
        value: {
          companyName: record.site.company.name,
          partyName: record.vendor.name,
          projectName: record.site.name,
          siteLocationSubtitle: `${record.site.city}, ${record.site.state}`,
        },
        customTemplateKey: 'docWorkspaceContextDetail',
        detailTemplateFullRow: true,
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
        label: 'Amount',
        value: record.taxableAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Payment Hold Reason',
        value: record.paymentHoldReason ?? '—',
      },
    ];

    const detail: IDataViewDetails = {
      status: {
        entryType: 'Bank Transfer',
        approvalStatus: record.hasTransfer === true ? 'Done' : 'Pending',
      },
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
}
