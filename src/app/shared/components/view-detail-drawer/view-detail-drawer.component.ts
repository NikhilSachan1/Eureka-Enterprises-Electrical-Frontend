import { DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { AppConfigService } from '@core/services';
import { IDrawerDetail, IDrawerEmployeeDetails } from '@shared/models';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import { AvatarService } from '@shared/services';
import { EDrawerDetailType } from '@shared/types';
import { ColorUtil } from '@shared/utils/color.util';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';

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
  ],
  templateUrl: './view-detail-drawer.component.html',
  styleUrl: './view-detail-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewDetailDrawerComponent {
  private readonly avatarService = inject(AvatarService);
  protected readonly appConfigService = inject(AppConfigService);

  protected readonly _avtarImageUrl = computed(() => this.getAvatarUrl());

  drawerDetails = input<IDrawerDetail[]>();
  drawerEmployeeDetails = input<IDrawerEmployeeDetails>();

  protected readonly ALL_DRAWER_DETAIL_TYPES = EDrawerDetailType;

  protected getApprovalStatusColor(status: string): string {
    return ColorUtil.getSeverity(status);
  }

  protected getColor(status: string): string {
    return ColorUtil.getColor(status);
  }

  protected getAvatarUrl(): string {
    const name = this.drawerEmployeeDetails()?.name ?? 'No Name';
    return this.avatarService.getAvatarFromName(name);
  }
}
