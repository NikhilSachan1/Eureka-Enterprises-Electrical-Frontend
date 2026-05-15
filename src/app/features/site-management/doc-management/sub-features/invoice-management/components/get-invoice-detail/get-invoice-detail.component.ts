import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  IInvoiceDetailGetRequestDto,
  IInvoiceDetailGetResponseDto,
  IInvoiceGetBaseResponseDto,
} from '../../types/invoice.dto';
import { InvoiceService } from '../../services/invoice.service';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import type { IDocReferenceSegment } from '@features/site-management/doc-management/shared/types/doc-reference.interface';

@Component({
  selector: 'app-get-invoice-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewDetailComponent, DocReferenceComponent, DocAmountComponent],
  templateUrl: './get-invoice-detail.component.html',
  styleUrl: './get-invoice-detail.component.scss',
})
export class GetInvoiceDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    invoice: IInvoiceGetBaseResponseDto;
  };
  private readonly invoiceService = inject(InvoiceService);
  private readonly loadingService = inject(LoadingService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _invoiceDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;
  override onDrawerShow(): void {
    this.loadInvoiceDetails();
  }

  private loadInvoiceDetails(): void {
    this.loadingService.show({
      title: 'Loading Invoice Details',
      message:
        "We're loading the invoice details. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.invoiceService
      .getInvoiceDetailById(paramData.id)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IInvoiceDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._invoiceDetails.set(mappedData);
          this.logger.logUserAction('Invoice details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IInvoiceDetailGetRequestDto {
    return {
      id: this.drawerData.invoice.id,
    };
  }

  private mapDetailData(
    response: IInvoiceDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const record = response;

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
        label: 'Invoice Date',
        value: record.invoiceDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Document reference',
        value: this.documentReferenceSegmentsForInvoiceDetail(record),
        customTemplateKey: 'documentReferenceHierarchy',
        detailTemplateFullRow: false,
      },
      {
        label: 'Invoice amounts',
        value: {
          taxableAmount: record.taxableAmount,
          gstAmount: record.gstAmount,
          gstPercentage: `${record.gstPercentage}%`,
          totalAmount: record.totalAmount,
        },
        customTemplateKey: 'invoiceDetailAmounts',
      },
      {
        label: 'Lock status',
        value: record.isLocked ? 'Locked' : 'Unlocked',
        type: EDataType.STATUS,
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
      entity: this.getInvoiceDetails(),
    };
  }

  protected getInvoiceDetails(): IEntityViewDetails {
    const { contractor, vendor, invoiceNumber } = this.drawerData.invoice;
    const parts = [contractor?.name, vendor?.name].filter(Boolean);
    return {
      name: parts.length > 0 ? parts.join(' · ') : 'Invoice',
      subtitle: invoiceNumber,
    };
  }

  protected docInvoiceDrawerTaxGstSegments(v: {
    taxableAmount: string;
    gstAmount: string;
    totalAmount: string;
    gstPercentage: string;
  }): IDocAmountSegment[] {
    const raw = v.gstPercentage?.trim();
    const gstSuffix =
      raw && !raw.startsWith('(') ? `(${raw})` : (v.gstPercentage ?? undefined);
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
        suffix: gstSuffix,
      },
      {
        dataType: EDataType.CURRENCY,
        label: 'Total',
        value: v.totalAmount,
      },
    ];
  }

  private documentReferenceSegmentsForInvoiceDetail(
    record: IInvoiceDetailGetResponseDto
  ): IDocReferenceSegment[] {
    const jmc = record.jmc?.jmcNumber?.trim();
    const po = record.jmc?.po?.poNumber?.trim();
    const segments: IDocReferenceSegment[] = [];
    if (jmc) {
      segments.push({ label: 'JMC', value: jmc });
    }
    if (po) {
      segments.push({ label: 'PO', value: po });
    }
    return segments;
  }

  private buildSiteLocationSuffix(
    site: IInvoiceDetailGetResponseDto['site'] | null | undefined
  ): string | undefined {
    if (!site) {
      return undefined;
    }
    const parts = [site.city, site.state].filter(
      (part): part is string => !!part && part.trim().length > 0
    );
    return parts.length > 0 ? ` · ${parts.join(', ')}` : undefined;
  }
}
