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
import {
  AppConfigurationService,
  GalleryService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import {
  EDataType,
  IAttachmentsGetResponseDto,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IDetailEntryData,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { isPoSystemGenerated } from '../../utils/po-table-row.util';
import { parsePoTerms } from '../../utils/po-terms.util';

@Component({
  selector: 'app-get-po-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ViewDetailComponent,
    DocAmountComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-po-detail.component.html',
  styleUrl: './get-po-detail.component.scss',
})
export class GetPoDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    po: IPoGetBaseResponseDto;
  };
  private readonly poService = inject(PoService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly galleryService = inject(GalleryService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);

  protected readonly _poDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;
  override onDrawerShow(): void {
    this.loadPoDetails();
  }

  private loadPoDetails(): void {
    this.setDrawerLoading(true);
    const paramData = this.prepareParamData();

    this.poService
      .getPoDetailById(paramData.id)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
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
    ];

    if (isPoSystemGenerated(record) && record.items?.length) {
      entryData.push({
        label: 'Line items',
        value: record.items,
        customTemplateKey: 'poLineItems',
        detailTemplateFullRow: true,
        detailTemplatePlain: true,
      });
    }

    if (isPoSystemGenerated(record) && record.termsAndConditions) {
      entryData.push({
        label: 'Terms & conditions',
        value: parsePoTerms(record.termsAndConditions).map(term =>
          term.replace(/^\d+\.\s*/, '').trim()
        ),
        customTemplateKey: 'poTerms',
        detailTemplateFullRow: true,
        detailTemplatePlain: true,
      });
    }

    if (isPoSystemGenerated(record) && record.gstType) {
      entryData.push({
        label: 'GST type',
        value: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.poGstTypes(),
          record.gstType
        ),
        type: EDataType.TEXT,
      });
    }

    entryData.push({
      label: 'PO amounts',
      value: {
        taxableAmount: record.taxableAmount,
        gstAmount: record.gstAmount,
        totalAmount: record.totalAmount,
        gstPercentage: `${record.gstPercentage}%`,
      },
      customTemplateKey: 'poDetailPoAmounts',
    });

    entryData.push({
      label: 'Invoice & payment',
      value: {
        partyType: record.partyType,
        invoicedTotal: record.invoicedTotal,
        bookedTotal: record.bookedTotal,
        paidTotal: record.paidTotal,
        lastInvoiceAt: record.lastInvoiceAt,
        lastPaymentAt: record.lastPaymentAt,
      },
      customTemplateKey: 'poDetailInvoiceTotals',
    });

    entryData.push({
      label: 'Attachments',
      value: isPoSystemGenerated(record)
        ? [record.id]
        : record.fileKey
          ? [record.fileKey]
          : [],
      type: EDataType.ATTACHMENTS,
      enableAttachmentGallery: !isPoSystemGenerated(record),
    });

    const detail: IDataViewDetails = {
      status: {
        entryType: record.partyType,
        approvalStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.projectDocumentApprovalStatuses(),
          record.approvalStatus
        ),
      },
      entryData,
      approvalBy: {
        user: record.approvalByUser,
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

  protected handleDetailAttachmentClick(entry: IDetailEntryData): void {
    const poId = (entry.value as string[])?.[0];
    if (!poId) {
      return;
    }
    this.openPoDoc(poId);
  }

  protected openPoDoc(poId: string): void {
    this.loadingService.show({
      title: 'Loading PO DOC',
      message: 'Fetching the PO document. Please wait…',
    });

    this.poService
      .getPoPdf(poId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttachmentsGetResponseDto) => {
          this.galleryService.show([
            {
              mediaKey: response.key,
              actualMediaUrl: response.url,
            },
          ]);
        },
        error: error => {
          this.logger.logUserAction('Failed to load PO PDF', error);
          this.notificationService.error(
            'Could not load the PO document. Please try again.'
          );
        },
      });
  }

  protected docPoDrawerTaxGstSegments(v: {
    taxableAmount: string;
    gstAmount: string;
    totalAmount: string;
    gstPercentage: string;
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
        suffix: `(${v.gstPercentage})`,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Total',
        value: v.totalAmount,
      },
    ];
  }

  protected docPoDrawerInvoicePaymentSegments(v: {
    partyType: EDocContext;
    invoicedTotal: string;
    bookedTotal: string;
    paidTotal: string;
    lastInvoiceAt: string | null | undefined;
    lastPaymentAt: string | null | undefined;
  }): IDocAmountSegment[] {
    const isSales = v.partyType === EDocContext.SALES;
    const segments: IDocAmountSegment[] = [
      {
        dataType: EDataType.CURRENCY,
        label: 'Invoiced',
        value: v.invoicedTotal,
      },
    ];
    if (!isSales) {
      segments.push({
        dataType: EDataType.CURRENCY,
        label: 'Booked',
        value: v.bookedTotal,
      });
    }
    segments.push(
      {
        dataType: EDataType.CURRENCY,
        label: 'Paid',
        value: v.paidTotal,
      },
      {
        dataType: EDataType.DATE,
        label: 'Last invoice',
        value: v.lastInvoiceAt,
      },
      {
        dataType: EDataType.DATE,
        label: 'Last payment',
        value: v.lastPaymentAt,
      }
    );
    return segments;
  }
}
