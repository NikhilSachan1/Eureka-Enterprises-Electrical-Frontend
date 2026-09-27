import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  IAdvancePaymentDetailGetResponseDto,
  IAdvancePaymentGetBaseResponseDto,
} from '../../types/advance-payment.dto';
import { AdvancePaymentService } from '../../services/advance-payment.service';
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
import {
  buildAdvancePaymentWorkspaceContext,
  resolveAdvancePaymentFileKeys,
  resolveAdvancePaymentPoNumber,
  resolveAdvancePaymentVendorName,
} from '../../utils/advance-payment-table-row.util';

@Component({
  selector: 'app-get-advance-payment-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewDetailComponent, DocWorkspaceContextComponent],
  templateUrl: './get-advance-payment-detail.component.html',
  styleUrl: './get-advance-payment-detail.component.scss',
})
export class GetAdvancePaymentDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    advancePayment: IAdvancePaymentGetBaseResponseDto;
  };
  private readonly advancePaymentService = inject(AdvancePaymentService);

  protected readonly _advancePaymentDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;

  override onDrawerShow(): void {
    this.loadAdvancePaymentDetails();
  }

  private loadAdvancePaymentDetails(): void {
    this.setDrawerLoading(true);
    const { id } = this.drawerData.advancePayment;

    this.advancePaymentService
      .getAdvancePaymentDetailById(id)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAdvancePaymentDetailGetResponseDto) => {
          this._advancePaymentDetails.set(
            this.mapAdvancePaymentDetailData(response)
          );
          this.logger.logUserAction('Advance payment detail loaded');
        },
        error: error => {
          this.logger.error('Failed to load advance payment detail', error);
        },
      });
  }

  private mapAdvancePaymentDetailData(
    record: IAdvancePaymentDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Workspace overview',
        value: buildAdvancePaymentWorkspaceContext(record),
        customTemplateKey: 'docWorkspaceContextDetail',
        detailTemplateFullRow: true,
      },
      {
        label: 'Advance No.',
        value: record.advanceNumber ?? '—',
      },
      {
        label: 'PO Number',
        value: resolveAdvancePaymentPoNumber(record) ?? '—',
      },
      {
        label: 'PO Date',
        value: record.po?.poDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Advance Date',
        value: record.advanceDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Advance Amount',
        value: record.amount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Settled Amount',
        value: record.settledAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Balance Amount',
        value: record.balanceAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Attachment',
        value: resolveAdvancePaymentFileKeys(record),
        type: EDataType.ATTACHMENTS,
      },
    ];

    const detail: IDataViewDetails = {
      status: {
        approvalStatus: record.approvalStatus,
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
    record: IAdvancePaymentDetailGetResponseDto
  ): IEntityViewDetails {
    return {
      name:
        resolveAdvancePaymentVendorName(record).trim() || 'Advance payment',
      subtitle:
        record.advanceNumber ??
        resolveAdvancePaymentPoNumber(record) ??
        record.id,
    };
  }
}
