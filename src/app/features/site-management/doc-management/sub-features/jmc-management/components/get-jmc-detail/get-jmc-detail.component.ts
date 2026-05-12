import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import {
  IJmcDetailGetRequestDto,
  IJmcDetailGetResponseDto,
  IJmcGetBaseResponseDto,
} from '../../types/jmc.dto';
import { JmcService } from '../../services/jmc.service';
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

@Component({
  selector: 'app-get-jmc-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewDetailComponent],
  templateUrl: './get-jmc-detail.component.html',
  styleUrl: './get-jmc-detail.component.scss',
})
export class GetJmcDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    jmc: IJmcGetBaseResponseDto;
  };
  private readonly jmcService = inject(JmcService);
  private readonly loadingService = inject(LoadingService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _jmcDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly APP_CONFIG = APP_CONFIG;

  override onDrawerShow(): void {
    this.loadJmcDetails();
  }

  private loadJmcDetails(): void {
    this.loadingService.show({
      title: 'Loading JMC Details',
      message: "We're loading the JMC details. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.jmcService
      .getJmcDetailById(paramData.id)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IJmcDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._jmcDetails.set(mappedData);
          this.logger.logUserAction('JMC details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IJmcDetailGetRequestDto {
    return {
      id: this.drawerData.jmc.id,
    };
  }

  private mapDetailData(
    response: IJmcDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const record = response;

    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Company Name',
        value: record.company?.name ?? 'N/A',
      },
      {
        label: 'Site Name',
        value: record.site?.name ?? 'N/A',
        suffix: this.buildSiteLocationSuffix(record.site),
      },
      {
        label: 'JMC Date',
        value: record.jmcDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'PO Number',
        value: record.po?.poNumber ?? 'N/A',
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
      entity: this.getJmcDetails(),
    };
  }

  protected getJmcDetails(): IEntityViewDetails {
    const { contractor, vendor, jmcNumber } = this.drawerData.jmc;
    const parts = [contractor?.name, vendor?.name].filter(Boolean);
    return {
      name: parts.length > 0 ? parts.join(' · ') : 'Job material certificate',
      subtitle: jmcNumber,
    };
  }

  private buildSiteLocationSuffix(
    site: IJmcDetailGetResponseDto['site'] | null | undefined
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
