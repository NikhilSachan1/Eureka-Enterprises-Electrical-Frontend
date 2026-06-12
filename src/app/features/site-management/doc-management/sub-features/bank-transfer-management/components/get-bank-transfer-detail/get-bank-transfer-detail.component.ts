import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  IBankTransferDetailGetResponseDto,
  IBankTransferGetBaseResponseDto,
} from '../../types/bank-transfer.dto';
import { BankTransferService } from '../../services/bank-transfer.service';
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
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

@Component({
  selector: 'app-get-bank-transfer-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ViewDetailComponent,
    DocReferenceComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-bank-transfer-detail.component.html',
  styleUrl: './get-bank-transfer-detail.component.scss',
})
export class GetBankTransferDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    bankTransfer: IBankTransferGetBaseResponseDto;
  };
  private readonly bankTransferService = inject(BankTransferService);

  protected readonly _details = signal<IDataViewDetailsWithEntity | undefined>(
    undefined
  );

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;

  override onDrawerShow(): void {
    this.loadDetails();
  }

  private loadDetails(): void {
    this.setDrawerLoading(true);
    const { id } = this.drawerData.bankTransfer;

    this.bankTransferService
      .getBankTransferDetailById(id)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IBankTransferDetailGetResponseDto) => {
          this._details.set(this.mapDetailData(response));
          this.logger.logUserAction('Bank transfer detail loaded');
        },
        error: error => {
          this.logger.error('Failed to load bank transfer detail', error);
        },
      });
  }

  private mapDetailData(
    record: IBankTransferDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const invoiceRef = invoiceRefForBankTransfer(record);
    const isSales = record.partyType === EDocContext.SALES;

    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Workspace overview',
        value: {
          companyName: record.site.company.name,
          partyName: [record.contractor?.name, record.vendor?.name]
            .filter((n): n is string => Boolean(n))
            .join(' · '),
          projectName: record.site.name,
          siteLocationSubtitle: `${record.site.city}, ${record.site.state}`,
        },
        customTemplateKey: 'docWorkspaceContextDetail',
        detailTemplateFullRow: true,
      },
      {
        label: 'Document reference',
        value: DocReferenceHierarchy.forBankTransferDetailReference({
          poNumber: invoiceRef?.jmc?.po?.poNumber,
          jmcNumber: invoiceRef?.jmc?.jmcNumber,
          invoiceNumber: invoiceRef?.invoiceNumber,
          bookPayment:
            record.partyType === EDocContext.PURCHASE ? record.createdAt : null,
        }),
        customTemplateKey: 'documentReferenceHierarchy',
        detailTemplateFullRow: false,
      },
      {
        label: isSales ? 'Received Date' : 'Transfer Date',
        value: record.transferDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'UTR / Reference',
        value: record.utrNumber,
      },
      {
        label: 'Amount',
        value: record.transferAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: isSales ? 'Proof of receipt' : 'Proof of transfer',
        value: proofAttachmentKeysForBankTransferDetail(record),
        type: EDataType.ATTACHMENTS,
      },
      ...(record.paymentAdvice
        ? [
            {
              label: 'Payment Advice',
              value: record.paymentAdvice.referenceNumber,
            },
            {
              label: 'PA Attachment',
              value: record.paymentAdvice.pdfKey
                ? [record.paymentAdvice.pdfKey]
                : [],
              type: EDataType.ATTACHMENTS,
            },
          ]
        : []),
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
    record: IBankTransferDetailGetResponseDto
  ): IEntityViewDetails {
    return {
      name: record.utrNumber,
    };
  }
}

function invoiceRefForBankTransfer(
  record: Pick<IBankTransferGetBaseResponseDto, 'invoice' | 'bookPayment'>
): IBankTransferGetBaseResponseDto['invoice'] {
  return record.invoice ?? record.bookPayment?.invoice ?? null;
}

function proofAttachmentKeysForBankTransferDetail(
  record: IBankTransferDetailGetResponseDto
): string[] {
  if (record.partyType === EDocContext.PURCHASE && record.proofFileKey) {
    return [record.proofFileKey];
  }
  return record.proofFileKey ? [record.proofFileKey] : [];
}
