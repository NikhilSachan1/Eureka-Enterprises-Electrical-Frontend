import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AppConfigService } from '@core/services';
import {
  EDataType,
  EPrimeNGSeverity,
  IGalleryInputData,
  IButtonConfig,
  EButtonActionType,
  EButtonSize,
  EButtonBadgeSeverity,
  EButtonVariant,
  IDataViewDetails,
  IEmployeeViewDetails,
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import { AvatarService, GalleryService } from '@shared/services';
import { ColorUtil } from '@shared/utility';
import { ICONS } from '@shared/constants';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { ButtonComponent } from '../button/button.component';

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
    ButtonComponent,
  ],
  templateUrl: './view-detail.component.html',
  styleUrl: './view-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDetailComponent {
  private readonly avatarService = inject(AvatarService);
  private readonly galleryService = inject(GalleryService);
  protected readonly appConfigService = inject(AppConfigService);

  protected readonly _avtarImageUrl = computed(() => this.getAvatarUrl());

  drawerDetails = input<IDataViewDetails[]>();
  drawerEmployeeDetails = input<IEmployeeViewDetails>();

  protected readonly ALL_DATA_TYPES = EDataType;
  protected readonly icons = ICONS;

  protected getApprovalStatusColor(status: string): EPrimeNGSeverity {
    return ColorUtil.getSeverity(status) as EPrimeNGSeverity;
  }

  protected getColor(status: string): {
    bg: string;
    border: string;
    text: string;
  } {
    return ColorUtil.getColorClass(status);
  }

  protected getAvatarUrl(): string {
    const name = this.drawerEmployeeDetails()?.name ?? 'No Name';
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

  protected getAttachmentButtonConfig(count: number): Partial<IButtonConfig> {
    return {
      id: EButtonActionType.VIEW,
      label: 'View',
      icon: this.icons.COMMON.PAPERCLIP,
      size: EButtonSize.SMALL,
      badge: count.toString(),
      badgeSeverity: EButtonBadgeSeverity.INFO,
      variant: EButtonVariant.TEXT,
    };
  }
}
