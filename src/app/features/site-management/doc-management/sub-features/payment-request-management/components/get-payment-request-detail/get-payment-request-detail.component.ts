import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  IPaymentRequestDetailGetResponseDto,
  IPaymentRequestGetBaseResponseDto,
} from '../../types/payment-request.dto';
import { PaymentRequestService } from '../../services/payment-request.service';
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
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';

@Component({
  selector: 'app-get-payment-request-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewDetailComponent, DocWorkspaceContextComponent],
  templateUrl: './get-payment-request-detail.component.html',
  styleUrl: './get-payment-request-detail.component.scss',
})
export class GetPaymentRequestDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    paymentRequest: IPaymentRequestGetBaseResponseDto;
  };
  private readonly paymentRequestService = inject(PaymentRequestService);

  protected readonly _paymentRequestDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;

  override onDrawerShow(): void {
    this.loadPaymentRequestDetails();
  }

  private loadPaymentRequestDetails(): void {
    this.setDrawerLoading(true);
    const { id } = this.drawerData.paymentRequest;

    this.paymentRequestService
      .getPaymentRequestDetailById(id)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPaymentRequestDetailGetResponseDto) => {
          this._paymentRequestDetails.set(
            this.mapPaymentRequestDetailData(response)
          );
          this.logger.logUserAction('Payment request detail loaded');
        },
        error: error => {
          this.logger.error('Failed to load payment request detail', error);
        },
      });
  }

  private mapPaymentRequestDetailData(
    record: IPaymentRequestDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Workspace overview',
        value: {
          companyName: record.site?.company?.name ?? '',
          partyName: record.vendor?.name ?? '',
          projectName: record.site?.name ?? '',
          siteLocationSubtitle: [record.site?.city, record.site?.state]
            .filter((part): part is string => Boolean(part))
            .join(', '),
        },
        customTemplateKey: 'docWorkspaceContextDetail',
        detailTemplateFullRow: true,
      },
      {
        label: 'Invoice Number',
        value: record.invoice?.invoiceNumber ?? '—',
      },
      {
        label: 'Requested Amount',
        value: record.requestedAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Approved Amount',
        value: record.approvedAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
    ];

    const detail: IDataViewDetails = {
      status: {
        approvalStatus: record.status,
      },
      entryData,
      approvalBy: {
        user: record.approvalByUser,
        date: record.approvalAt,
        notes: record.remarks ?? record.rejectionReason ?? undefined,
      },
      createdBy: {
        user: record.createdByUser,
        date: record.createdAt,
        notes: record.reason ?? undefined,
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
    record: IPaymentRequestDetailGetResponseDto
  ): IEntityViewDetails {
    return {
      name: record.vendor?.name?.trim() || 'Payment request',
      subtitle: record.invoice?.invoiceNumber ?? record.id,
    };
  }
}
