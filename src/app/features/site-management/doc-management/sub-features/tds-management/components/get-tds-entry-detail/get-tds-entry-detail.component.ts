import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  ITdsEntryDetailGetResponseDto,
  ITdsEntryGetBaseResponseDto,
} from '../../types/tds.dto';
import { TdsService } from '../../services/tds.service';
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
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

@Component({
  selector: 'app-get-tds-entry-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ViewDetailComponent,
    DocReferenceComponent,
    DocAmountComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-tds-entry-detail.component.html',
  styleUrl: './get-tds-entry-detail.component.scss',
})
export class GetTdsEntryDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    tdsEntry: ITdsEntryGetBaseResponseDto;
  };
  private readonly tdsService = inject(TdsService);

  protected readonly _tdsEntryDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  override onDrawerShow(): void {
    this.loadTdsEntryDetails();
  }

  private loadTdsEntryDetails(): void {
    this.setDrawerLoading(true);

    this.tdsService
      .getTdsEntryDetailById(this.drawerData.tdsEntry.id)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ITdsEntryDetailGetResponseDto) => {
          this._tdsEntryDetails.set(this.mapTdsEntryDetailData(response));
          this.logger.logUserAction('TDS entry detail loaded successfully');
        },
        error: error => {
          this.logger.error('Failed to load TDS entry detail', error);
        },
      });
  }

  private mapTdsEntryDetailData(
    record: ITdsEntryDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const invoiceRef =
      record.partyType === EDocContext.PURCHASE
        ? (record.bookPayment?.invoice ?? null)
        : (record.bankTransfer?.invoice ?? null);

    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Workspace overview',
        value: {
          companyName: record.site.company.name,
          partyName:
            record.partyType === EDocContext.SALES
              ? (record.contractor?.name ?? '—')
              : (record.vendor?.name ?? '—'),
          partyType:
            record.partyType === EDocContext.SALES ? 'Contractor' : 'Vendor',
          projectName: record.site.name,
          siteLocationSubtitle: `${record.site.city}, ${record.site.state}`,
        },
        customTemplateKey: 'docWorkspaceContextDetail',
        detailTemplateFullRow: true,
      },
      {
        label: 'Payment date',
        value:
          record.partyType === EDocContext.PURCHASE
            ? (record.bookPayment?.bookingDate ?? '')
            : (record.bankTransfer?.transferDate ?? ''),
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      ...(!record.isVerified && record.revertReason
        ? [
            {
              label: 'Revert reason',
              value: record.revertReason,
              type: EDataType.TEXT_WITH_READ_MORE,
            },
          ]
        : []),
      {
        label: 'Document reference',
        value: DocReferenceHierarchy.forTdsEntryReference({
          partyType: record.partyType,
          poNumber: invoiceRef?.jmc?.po?.poNumber,
          jmcNumber: invoiceRef?.jmc?.jmcNumber,
          invoiceNumber: invoiceRef?.invoiceNumber,
          bookPaymentDate: record.bookPayment?.bookingDate,
          bankTransferDate: record.bankTransfer?.transferDate,
        }),
        customTemplateKey: 'documentReferenceHierarchy',
        detailTemplateFullRow: false,
      },
      {
        label: 'Amounts',
        value: {
          taxableAmount: record.taxableAmount,
          tdsAmount: record.tdsAmount,
        },
        customTemplateKey: 'tdsEntryDetailAmounts',
        detailTemplateFullRow: false,
      },
    ];

    entryData.push({
      label: 'Attachment',
      value: record.verifyFileKey ? [record.verifyFileKey] : [],
      type: EDataType.ATTACHMENTS,
    });

    const detail: IDataViewDetails = {
      status: {
        entryType: record.partyType,
        approvalStatus: record.isVerified ? 'approved' : 'pending',
      },
      entryData,
      ...(record.isVerified && record.verifiedByUser
        ? {
            approvalBy: {
              user: record.verifiedByUser,
              date: record.verifiedAt,
              notes: record.verifyRemarks,
            },
          }
        : {}),
    };

    return {
      details: [detail],
      entity: this.headerFromRecord(record),
    };
  }

  private headerFromRecord(
    record: ITdsEntryDetailGetResponseDto
  ): IEntityViewDetails {
    const invoiceRef =
      record.partyType === EDocContext.PURCHASE
        ? (record.bookPayment?.invoice ?? null)
        : (record.bankTransfer?.invoice ?? null);

    return {
      name:
        record.partyType === EDocContext.SALES
          ? (record.contractor?.name ?? '').trim()
          : (record.vendor?.name ?? '').trim(),
      subtitle: invoiceRef?.invoiceNumber ?? '—',
    };
  }

  protected docTdsEntryDrawerAmountSegments(v: {
    taxableAmount: string;
    tdsAmount: string;
  }): IDocAmountSegment[] {
    return [
      {
        dataType: EDataType.CURRENCY,
        label: 'Taxable',
        value: v.taxableAmount,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'TDS',
        value: v.tdsAmount,
      },
    ];
  }
}
