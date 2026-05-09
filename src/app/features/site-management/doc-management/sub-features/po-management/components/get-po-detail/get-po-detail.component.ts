import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  IPoDetailGetRequestDto,
  IPoDetailGetResponseDto,
  IPoGetBaseResponseDto,
} from '../../types/po.dto';
import { PoService } from '../../services/po.service';
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

@Component({
  selector: 'app-get-po-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewDetailComponent, CurrencyPipe, DatePipe],
  templateUrl: './get-po-detail.component.html',
  styleUrl: './get-po-detail.component.scss',
})
export class GetPoDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    po: IPoGetBaseResponseDto;
  };
  private readonly poService = inject(PoService);
  private readonly loadingService = inject(LoadingService);

  protected readonly _poDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;

  override onDrawerShow(): void {
    this.loadPoDetails();
  }

  private loadPoDetails(): void {
    this.loadingService.show({
      title: 'Loading PO Details',
      message: "We're loading the PO details. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.poService
      .getPoDetailById(paramData.id)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPoDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._poDetails.set(mappedData);
          this.logger.logUserAction('PO details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IPoDetailGetRequestDto {
    return {
      id: this.drawerData.po.id,
    };
  }

  private mapDetailData(
    response: IPoDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const record = response;

    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'PO Date',
        value: record.poDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Lock status',
        value: record.isLocked ? 'Locked' : 'Unlocked',
        type: EDataType.STATUS,
      },
      {
        label: 'PO amounts',
        value: {
          taxableAmount: record.taxableAmount,
          gstAmount: record.gstAmount,
          totalAmount: record.totalAmount,
        },
        customTemplateKey: 'poDetailPoAmounts',
      },
      {
        label: 'Invoice & payment',
        value: {
          invoicedTotal: record.invoicedTotal,
          bookedTotal: record.bookedTotal,
          paidTotal: record.paidTotal,
          lastInvoiceAt: record.lastInvoiceAt,
          lastPaymentAt: record.lastPaymentAt,
        },
        customTemplateKey: 'poDetailInvoiceTotals',
      },
    ];

    entryData.push({
      label: 'Attachment(s)',
      value: record.fileKey ? [record.fileKey] : [],
      type: EDataType.ATTACHMENTS,
    });

    const detail: IDataViewDetails = {
      status: {
        entryType: record.partyType,
        approvalStatus: record.approvalStatus,
      },
      entryData,
      approvalBy: {
        user: record.approvalBy,
        date: record.approvalAt,
        notes: record.approvalReason,
      },
      createdBy: {
        user: record.createdByUser,
        date: record.createdAt,
        notes: record.remarks,
      },
      updatedBy: {
        user: record.updatedByUser,
        date: record.updatedAt,
      },
    };

    return {
      details: [detail],
      entity: this.getPoDetails(),
    };
  }

  protected getPoDetails(): IEntityViewDetails {
    const { contractor, vendor, poNumber } = this.drawerData.po;
    const parts = [contractor?.name, vendor?.name].filter(Boolean);
    return {
      name: parts.length > 0 ? parts.join(' · ') : 'Purchase order',
      subtitle: poNumber,
    };
  }
}
