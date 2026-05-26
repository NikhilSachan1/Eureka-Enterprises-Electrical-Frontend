import { DatePipe } from '@angular/common';
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
  IAnnouncementAcknowledgementRecordDto,
  IAnnouncementAcknowledgementsGetResponseDto,
  IAnnouncementDetailGetFormDto,
  IAnnouncementDetailGetResponseDto,
  IAnnouncementGetBaseResponseDto,
} from '@features/announcement-management/types/announcement.dto';
import { IAnnouncementTargetWithAcknowledgement } from '@features/announcement-management/types/announcement.interface';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { AppConfigurationService, AvatarService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { finalize, forkJoin } from 'rxjs';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { AnnouncementContentPreviewComponent } from '../announcement-content-preview/announcement-content-preview.component';

@Component({
  selector: 'app-get-announcement-detail',
  imports: [ViewDetailComponent, AnnouncementContentPreviewComponent, DatePipe],
  templateUrl: './get-announcement-detail.component.html',
  styleUrl: './get-announcement-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAnnouncementDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    announcement: IAnnouncementGetBaseResponseDto;
  };
  private readonly announcementService = inject(AnnouncementService);
  protected readonly appConfigService = inject(AppConfigurationService);
  private readonly avatarService = inject(AvatarService);

  protected getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name ?? '');
  }

  protected readonly _announcementDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;

  override onDrawerShow(): void {
    this.loadAnnouncementDetails();
  }

  private loadAnnouncementDetails(): void {
    this.setDrawerLoading(true);
    const paramData = this.prepareParamData();
    const { announcementId } = paramData;

    forkJoin({
      detail: this.announcementService.getAnnouncementDetailById(paramData),
      acknowledgements:
        this.announcementService.getAnnouncementAcknowledgements(
          announcementId
        ),
    })
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({
          detail,
          acknowledgements,
        }: {
          detail: IAnnouncementDetailGetResponseDto;
          acknowledgements: IAnnouncementAcknowledgementsGetResponseDto;
        }) => {
          const mappedData = this.mapDetailData(detail, acknowledgements);
          this._announcementDetails.set(mappedData);
          this.logger.logUserAction('Announcement details loaded successfully');
        },
        error: error => {
          this.logger.error('Failed to load announcement details', error);
        },
      });
  }

  private prepareParamData(): IAnnouncementDetailGetFormDto {
    return {
      announcementId: this.drawerData.announcement.id,
    };
  }

  private mapDetailData(
    response: IAnnouncementDetailGetResponseDto,
    acknowledgements: IAnnouncementAcknowledgementsGetResponseDto
  ): IDataViewDetailsWithEntity {
    const targetsWithAcknowledgement = this.mergeTargetsWithAcknowledgements(
      response.targets ?? [],
      acknowledgements.records
    );

    const mappedDetails = [response].map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Announcement Period',
          value: [record.startAt, record.expiryAt],
          type: EDataType.RANGE,
          dataType: EDataType.DATE,
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
          value: targetsWithAcknowledgement,
          customTemplateKey: 'announcementTargets',
        },
      ];

      return {
        status: {
          approvalStatus: getMappedValueFromArrayOfObjects(
            this.appConfigService.announcementStatuses(),
            record.status
          ),
        },
        entryData,
        createdBy: {
          user: record.createdByUser,
          date: record.createdAt,
        },
        updatedBy: {
          user: record.updatedByUser,
          date: record.updatedAt,
        },
      };
    });

    return {
      details: mappedDetails,
    };
  }

  private mergeTargetsWithAcknowledgements(
    targets: IAnnouncementDetailGetResponseDto['targets'],
    acknowledgements: IAnnouncementAcknowledgementRecordDto[]
  ): IAnnouncementTargetWithAcknowledgement[] {
    const acknowledgementByUserId = new Map(
      acknowledgements.map(record => [record.userId, record])
    );

    return targets.map(target => {
      const acknowledgement = acknowledgementByUserId.get(target.targetId);

      return {
        ...target,
        acknowledged: acknowledgement?.acknowledged ?? false,
        acknowledgedAt: acknowledgement?.acknowledgedAt ?? null,
      };
    });
  }
}
