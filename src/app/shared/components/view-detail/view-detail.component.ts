import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  NgClass,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { AppPermissionService } from '@core/services';
import {
  EDataType,
  EPrimeNGSeverity,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IDetailEntryData,
  EEntryType,
  IGalleryInputData,
  IUserInfo,
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import {
  AvatarService,
  GalleryService,
  AppConfigurationService,
} from '@shared/services';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import { StatusUtil, toTitleCase } from '@shared/utility';
import { ICONS } from '@shared/constants';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { ReadMoreComponent } from '../read-more/read-more.component';
import { APP_PERMISSION } from '@core/constants';
import { AppPermissionDirective } from '@shared/directives/app-permission.directive';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-view-detail',
  imports: [
    CardModule,
    Tag,
    Divider,
    NgTemplateOutlet,
    DatePipe,
    DecimalPipe,
    TextCasePipe,
    SecondsToDhmsPipe,
    NgClass,
    CurrencyPipe,
    ReadMoreComponent,
    AppPermissionDirective,
  ],
  templateUrl: './view-detail.component.html',
  styleUrl: './view-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDetailComponent {
  private readonly avatarService = inject(AvatarService);
  private readonly galleryService = inject(GalleryService);
  private readonly permissionService = inject(AppPermissionService);
  protected readonly appConfigService = inject(AppConfigurationService);

  protected readonly _avtarImageUrl = computed(() => {
    const name = this.drawerDetails()?.entity?.name ?? 'N/A';
    return this.getAvatarUrl(name);
  });

  drawerDetails = input<IDataViewDetailsWithEntity>();
  customTemplates = input<Record<string, TemplateRef<unknown>>>({});

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly icons = ICONS;
  protected readonly ALL_ENTRY_TYPES = EEntryType;
  protected readonly APP_PERMISSION = APP_PERMISSION;
  protected readonly APP_CONFIG = APP_CONFIG;

  protected getApprovalStatusColor(status: string): EPrimeNGSeverity {
    return StatusUtil.getSeverity(status) as EPrimeNGSeverity;
  }

  /** N/A / NA ko as-is; baaki ko title case. Sirf isi component ke liye. */
  protected getApprovalStatusDisplay(value: string): string {
    if (!value) {
      return value;
    }
    const n = value.trim().toUpperCase().replace(/\s/g, '');
    if (n === 'NA' || n === 'N/A') {
      return 'N/A';
    }
    return toTitleCase(value);
  }

  protected getColor(status: string): {
    bg: string;
    border: string;
    text: string;
  } {
    return StatusUtil.getColorClass(status);
  }

  protected getDetailCardBg(detail: IDataViewDetails): string {
    const approvalStatus = detail.status?.approvalStatus ?? '';
    return approvalStatus !== ''
      ? StatusUtil.getColorClass(approvalStatus).bg
      : '!bg-gray-50';
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

  protected getUserName(user: IUserInfo | null | undefined): string {
    if (!user) {
      return 'N/A';
    }
    return `${user.firstName} ${user.lastName}`.trim();
  }

  protected isRangeEmpty(rangeValues: unknown[]): boolean {
    if (!rangeValues || rangeValues.length === 0) {
      return true;
    }
    return rangeValues.every(
      val => val === null || val === undefined || val === ''
    );
  }

  protected isValueEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }
}
