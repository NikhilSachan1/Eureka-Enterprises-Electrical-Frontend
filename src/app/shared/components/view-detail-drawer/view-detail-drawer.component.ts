import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AppConfigService, LoggerService } from '@core/services';
import {
  IDrawerDetail,
  IDrawerEmployeeDetails,
  EDrawerDetailType,
  EPrimeNGSeverity,
  IGalleryInputData,
  IButtonConfig,
  EButtonActionType,
  EButtonSize,
  EButtonBadgeSeverity,
  EButtonVariant,
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import {
  AttachmentsService,
  AvatarService,
  GalleryService,
} from '@shared/services';
import { ColorUtil } from '@shared/utility';
import { ICONS } from '@shared/constants';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-view-detail-drawer',
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
  templateUrl: './view-detail-drawer.component.html',
  styleUrl: './view-detail-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDetailDrawerComponent {
  private readonly avatarService = inject(AvatarService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly galleryService = inject(GalleryService);
  private readonly logger = inject(LoggerService);
  protected readonly appConfigService = inject(AppConfigService);

  protected readonly _avtarImageUrl = computed(() => this.getAvatarUrl());

  drawerDetails = input<IDrawerDetail[]>();
  drawerEmployeeDetails = input<IDrawerEmployeeDetails>();

  protected readonly ALL_DRAWER_DETAIL_TYPES = EDrawerDetailType;
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
