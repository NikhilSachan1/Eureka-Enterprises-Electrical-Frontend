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
import { AppConfigurationService } from '@shared/services';
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
import { DocAmountComponent } from '@features/site-management/doc-management/shared/components/doc-amount/doc-amount.component';
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';
import type { IDocAmountSegment } from '@features/site-management/doc-management/shared/types/doc-amount.interface';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';
import { buildInvoiceTaxGstAmountSegments } from '../../utils/invoice-table-row.util';

@Component({
  selector: 'app-get-invoice-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ViewDetailComponent,
    DocReferenceComponent,
    DocAmountComponent,
    DocWorkspaceContextComponent,
  ],
  templateUrl: './get-invoice-detail.component.html',
  styleUrl: './get-invoice-detail.component.scss',
})
export class GetInvoiceDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    invoice: IInvoiceGetBaseResponseDto;
  };
  private readonly invoiceService = inject(InvoiceService);
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
    this.setDrawerLoading(true);
    const paramData = this.prepareParamData();

    this.invoiceService
      .getInvoiceDetailById(paramData.id)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
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
        label: 'Invoice Date',
        value: record.invoiceDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Document reference',
        value: DocReferenceHierarchy.forInvoiceDetail({
          poNumber: record.jmc.po.poNumber,
          jmcNumber: record.jmc.jmcNumber,
          invoiceNumber:
            !record.invoiceNumber || record.invoiceNumber.toUpperCase() === 'NA'
              ? null
              : record.invoiceNumber,
        }),
        customTemplateKey: 'documentReferenceHierarchy',
        detailTemplateFullRow: false,
      },
      {
        label: 'Invoice amounts',
        value: {
          taxableAmount: record.taxableAmount,
          tdsAmount: record.tdsAmount,
          tdsPercentage: `(${record.tdsPercentage}%)`,
          gstAmount: record.gstAmount,
          gstPercentage: `${record.gstPercentage}%`,
          isGstHold: record.isGstHold,
          totalAmount: record.totalAmount,
        },
        customTemplateKey: 'invoiceDetailAmounts',
        detailTemplateFullRow: false,
      },
      {
        label: 'Lock status',
        value: record.isLocked ? 'Locked' : 'Unlocked',
        type: EDataType.STATUS,
      },
    ];

    entryData.push({
      label: 'Attachment(s)',
      value:
        record.fileKey && record.fileKey.toUpperCase() !== 'NA'
          ? [record.fileKey]
          : [],
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
      subtitle:
        !invoiceNumber || invoiceNumber.toUpperCase() === 'NA'
          ? 'No Invoice'
          : invoiceNumber,
    };
  }

  protected docInvoiceDrawerTaxGstSegments(v: {
    taxableAmount: string;
    tdsAmount: string;
    tdsPercentage: string;
    gstAmount: string;
    totalAmount: string;
    gstPercentage: string;
    isGstHold?: boolean;
  }): IDocAmountSegment[] {
    return buildInvoiceTaxGstAmountSegments({
      taxableAmount: v.taxableAmount,
      tdsAmount: v.tdsAmount,
      tdsPercentage: v.tdsPercentage,
      gstAmount: v.gstAmount,
      gstPercentage: v.gstPercentage,
      totalAmount: v.totalAmount,
      isGstHold: v.isGstHold,
    });
  }
}
