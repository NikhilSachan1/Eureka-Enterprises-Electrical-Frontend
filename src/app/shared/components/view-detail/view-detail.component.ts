import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AppConfigService, AppPermissionService } from '@core/services';
import {
  EDataType,
  EPrimeNGSeverity,
  IGalleryInputData,
  IDataViewDetailsWithEntity,
  IDetailEntryData,
  EEntryType,
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import { AvatarService, GalleryService } from '@shared/services';
import { StatusUtil } from '@shared/utility';
import { ICONS } from '@shared/constants';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { ReadMoreComponent } from '../read-more/read-more.component';

@Component({
  selector: 'app-view-detail',
  imports: [
    CardModule,
    Tag,
    Divider,
    DatePipe,
    TextCasePipe,
    SecondsToDhmsPipe,
    NgClass,
    CurrencyPipe,
    ReadMoreComponent,
  ],
  templateUrl: './view-detail.component.html',
  styleUrl: './view-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDetailComponent {
  private readonly avatarService = inject(AvatarService);
  private readonly galleryService = inject(GalleryService);
  private readonly permissionService = inject(AppPermissionService);
  protected readonly appConfigService = inject(AppConfigService);

  protected readonly _avtarImageUrl = computed(() => {
    const name = this.drawerDetails()?.entity?.name ?? 'N/A';
    return this.getAvatarUrl(name);
  });

  drawerDetails = input<IDataViewDetailsWithEntity>();

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly icons = ICONS;
  protected readonly ALL_ENTRY_TYPES = EEntryType;

  protected getApprovalStatusColor(status: string): EPrimeNGSeverity {
    return StatusUtil.getSeverity(status) as EPrimeNGSeverity;
  }

  protected getColor(status: string): {
    bg: string;
    border: string;
    text: string;
  } {
    return StatusUtil.getColorClass(status);
  }

  protected getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }

  protected viewAttachment(fileKeys: string[]): void {
    if (fileKeys.length === 0) {
      return;
    }

    const media: IGalleryInputData[] = fileKeys.map((key: string) => ({
      mediaKey: key,
      actualMediaUrl: '',
    }));

    this.galleryService.show(media);
  }

  protected getAttachmentEntry(
    entryData: IDetailEntryData[]
  ): IDetailEntryData | undefined {
    const visibleEntries = this.getVisibleEntries(entryData);
    return visibleEntries.find(e => e.type === EDataType.ATTACHMENTS);
  }

  protected getVisibleEntries(
    entryData: IDetailEntryData[]
  ): IDetailEntryData[] {
    return this.permissionService.filterByPermission(entryData);
  }
}
