import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  IGstEntryDetailGetResponseDto,
  IGstEntryGetBaseResponseDto,
} from '../../types/gst.dto';
import { GstService } from '../../services/gst.service';
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
  selector: 'app-get-gst-entry-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ViewDetailComponent,
    DocReferenceComponent,
    DocAmountComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-gst-entry-detail.component.html',
  styleUrl: './get-gst-entry-detail.component.scss',
})
export class GetGstEntryDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    gstEntry: IGstEntryGetBaseResponseDto;
  };
  private readonly gstService = inject(GstService);

  protected readonly _gstEntryDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  override onDrawerShow(): void {
    this.loadGstEntryDetails();
  }

  private loadGstEntryDetails(): void {
    this.setDrawerLoading(true);

    this.gstService
      .getGstEntryDetailById(this.drawerData.gstEntry.id)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IGstEntryDetailGetResponseDto) => {
          this._gstEntryDetails.set(this.mapGstEntryDetailData(response));
          this.logger.logUserAction('GST entry detail loaded successfully');
        },
        error: error => {
          this.logger.error('Failed to load GST entry detail', error);
        },
      });
  }

  private mapGstEntryDetailData(
    record: IGstEntryDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
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
        label: 'Document reference',
        value: DocReferenceHierarchy.forBookPaymentRow({
          poNumber: record.invoice.jmc?.po?.poNumber,
          jmcNumber: record.invoice.jmc?.jmcNumber,
          invoiceNumber: record.invoice.invoiceNumber,
        }),
        customTemplateKey: 'documentReferenceHierarchy',
      },
      {
        label: 'Invoice date',
        value: record.invoice.invoiceDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Invoice month',
        value: record.invoiceMonth,
      },
      {
        label: 'GST type',
        value: record.gstType,
      },
      {
        label: 'Amounts',
        value: {
          taxableAmount: record.taxableAmount,
          gstAmount: record.gstAmount,
        },
        customTemplateKey: 'gstEntryDetailAmounts',
        detailTemplateFullRow: true,
      },
      {
        label: 'Verified at',
        value: record.verifiedAt,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
    ];

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
            },
          }
        : {}),
      createdBy: {
        user: record.createdByUser,
        date: record.createdAt,
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
    record: IGstEntryDetailGetResponseDto
  ): IEntityViewDetails {
    const partyName =
      record.partyType === EDocContext.SALES
        ? (record.contractor?.name ?? '')
        : (record.vendor?.name ?? '');

    return {
      name: partyName.trim(),
      subtitle: record.invoice.invoiceNumber,
    };
  }

  protected docGstEntryDrawerAmountSegments(v: {
    taxableAmount: string;
    gstAmount: string;
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
      },
    ];
  }
}
