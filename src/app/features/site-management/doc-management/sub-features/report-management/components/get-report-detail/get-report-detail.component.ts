import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  IReportDetailGetRequestDto,
  IReportDetailGetResponseDto,
  IReportGetBaseResponseDto,
} from '../../types/report.dto';
import { ReportService } from '../../services/report.service';
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
import { DocReferenceComponent } from '@features/site-management/doc-management/shared/components/doc-reference/doc-reference.component';
import { DocReferenceHierarchy } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';

@Component({
  selector: 'app-get-report-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewDetailComponent, DocReferenceComponent],
  templateUrl: './get-report-detail.component.html',
  styleUrl: './get-report-detail.component.scss',
})
export class GetReportDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    report: IReportGetBaseResponseDto;
  };
  private readonly reportService = inject(ReportService);
  private readonly loadingService = inject(LoadingService);

  protected readonly _reportDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;

  override onDrawerShow(): void {
    this.loadReportDetails();
  }

  private loadReportDetails(): void {
    this.loadingService.show({
      title: 'Loading report details',
      message:
        "We're loading the report details. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.reportService
      .getReportDetailById(paramData.id)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IReportDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._reportDetails.set(mappedData);
          this.logger.logUserAction('Report details loaded successfully');
        },
        error: error => {
          this.logger.error('Failed to load report details', error);
        },
      });
  }

  private prepareParamData(): IReportDetailGetRequestDto {
    return {
      id: this.drawerData.report.id,
    };
  }

  private mapDetailData(
    response: IReportDetailGetResponseDto
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
        label: 'Document reference',
        value: DocReferenceHierarchy.forReportDetail({
          poNumber: record.jmc.po.poNumber,
          jmcNumber: record.jmc.jmcNumber,
        }),
        customTemplateKey: 'documentReferenceHierarchy',
        detailTemplateFullRow: false,
      },
      {
        label: 'Report Date',
        value: record.reportDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
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
      },
      entryData,
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
      entity: this.getReportEntityHeader(),
    };
  }

  protected getReportEntityHeader(): IEntityViewDetails {
    const { contractor, vendor, reportNumber } = this.drawerData.report;
    const parts = [contractor?.name, vendor?.name].filter(Boolean);
    return {
      name: parts.length > 0 ? parts.join(' · ') : 'Report',
      subtitle: reportNumber,
    };
  }

  private buildSiteLocationSuffix(
    site: IReportDetailGetResponseDto['site'] | null | undefined
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
