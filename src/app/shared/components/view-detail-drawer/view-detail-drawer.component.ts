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
    if (status === 'approved') {
      return 'success';
    } else if (status === 'rejected') {
      return 'danger';
    } else if (status === 'pending') {
      return 'warn';
    }
    return 'info';
  }

  protected getStatusColor(status: string): string {
    if (status === 'present') {
      return 'text-green-500';
    } else if (status === 'absent') {
      return 'text-red-500';
    } else if (status === 'leave') {
      return 'text-yellow-500';
    } else if (status === 'holiday') {
      return 'text-blue-500';
    }
    return 'text-gray-500';
  }

  protected getCardColor(status: string): string {
    if (status === 'approved') {
      return '!bg-green-50';
    } else if (status === 'rejected') {
      return '!bg-red-50';
    } else if (status === 'pending') {
      return '!bg-yellow-50';
    }
    return '!bg-gray-50';
  }

  protected getAvatarUrl(): string {
    const name = this.drawerEmployeeDetails()?.name ?? 'No Name';
    return this.avatarService.getAvatarFromName(name);
  }
}
