import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { AnnouncementService } from '@features/announcement-management/services/announcement.service';
import {
  IAnnouncementDetailGetFormDto,
  IAnnouncementDetailGetResponseDto,
  IAnnouncementGetBaseResponseDto,
} from '@features/announcement-management/types/announcement.dto';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
} from '@shared/types';
import { finalize } from 'rxjs';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { AnnouncementContentPreviewComponent } from '../announcement-content-preview/announcement-content-preview.component';

@Component({
  selector: 'app-get-announcement-detail',
  imports: [
    ViewDetailComponent,
    StatusTagComponent,
    AnnouncementContentPreviewComponent,
  ],
  templateUrl: './get-announcement-detail.component.html',
  styleUrl: './get-announcement-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAnnouncementDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    announcement: IAnnouncementGetBaseResponseDto;
  };
  private readonly announcementService = inject(AnnouncementService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigService = inject(AppConfigurationService);

  protected readonly _announcementDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadAnnouncementDetails();
  }

  private loadAnnouncementDetails(): void {
    this.loadingService.show({
      title: 'Loading Announcement Details',
      message: 'Please wait while we load the announcement details...',
    });

    const paramData = this.prepareParamData();

    this.announcementService
      .getAnnouncementDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAnnouncementDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._announcementDetails.set(mappedData);
          this.logger.logUserAction('Announcement details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IAnnouncementDetailGetFormDto {
    return {
      announcementId: this.drawerData.announcement.id,
    };
  }

  private mapDetailData(
    response: IAnnouncementDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = [response].map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Announcement Period',
          value: [record.startAt, record.expiryAt],
          type: EDataType.DATE_RANGE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Title',
          value: record.title,
          type: EDataType.TEXT,
        },
        {
          label: 'Message',
          value: record.message,
          type: EDataType.TEXT,
          customTemplateKey: 'announcementMessage',
        },
        {
          label: 'Published At',
          value: record.publishedAt,
          type: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Expired At',
          value: record.expiredAt,
          type: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Targets',
          value: record.targets?.map(t => t.targetId) ?? [],
          customTemplateKey: 'announcementTargets',
        },
      ];

      return {
        status: {
          approvalStatus: record.status,
        },
        entryData,
        createdBy: {
          user: {},
          date: record.createdAt,
        },
        updatedBy: {
          user: {},
          date: record.updatedAt,
        },
      };
    });

    return {
      details: mappedDetails,
    };
  }
}
