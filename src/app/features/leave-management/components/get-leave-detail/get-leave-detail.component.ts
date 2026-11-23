import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { AppConfigurationService } from '@shared/services';
import { AvatarService } from '@shared/services/avatar.service';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects, StatusUtil } from '@shared/utility';
import {
  ILeaveGetBaseResponseDto,
  ILeaveGroupGetBaseResponseDto,
} from '../../types/leave.dto';
import {
  buildLeaveStatusChips,
  formatLeaveLabel,
  ILeaveStatusChip,
} from '../../utils/leave.util';

/**
 * Days decided together: same status, same person, same remark. A bulk approval of ten days is
 * one card, not ten.
 */
interface ILeaveDecisionGroup {
  key: string;
  statusLabel: string;
  dates: string[];
  decidedBy: { name: string; avatar: string; at: string | null } | null;
  remark: string;
  isPending: boolean;
}

/** Value of the drawer's "Day-wise status" field. */
interface ILeaveDayWiseView {
  chips: ILeaveStatusChip[];
  /** Share of days per status, for the bar on top. */
  segments: { status: string; count: number; color: string }[];
  groups: ILeaveDecisionGroup[];
}

@Component({
  selector: 'app-get-leave-detail',
  imports: [ViewDetailComponent, StatusTagComponent, DatePipe],
  templateUrl: './get-leave-detail.component.html',
  styleUrl: './get-leave-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetLeaveDetailComponent extends DrawerDetailBase {
  protected readonly DATE_FORMATS = APP_CONFIG.DATE_FORMATS;
  private readonly drawerData = inject(DRAWER_DATA) as {
    group: ILeaveGroupGetBaseResponseDto;
  };
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly avatarService = inject(AvatarService);

  protected readonly APP_CONFIG = APP_CONFIG;

  /** Built only from the row passed into the drawer — no detail API. */
  protected readonly leaveDetails: IDataViewDetailsWithEntity =
    this.buildDetails(this.drawerData.group);

  private statusLabel(status: string): string {
    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.approvalStatus(),
      status
    );
  }

  private buildDetails(
    group: ILeaveGroupGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const isMixed = group.approvalStatus === 'mixed';
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Leave Date',
        value: [group.fromDate, group.toDate],
        type: EDataType.RANGE,
        dataType: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Days',
        value: group.dayCount === 1 ? '1 day' : `${group.dayCount} days`,
      },
      { label: 'Leave Type', value: formatLeaveLabel(group.leaveType) },
      { label: 'Category', value: formatLeaveLabel(group.leaveCategory) },
      {
        label: 'Day-wise status',
        value: this.buildDayWise(group),
        customTemplateKey: 'leaveDayWise',
        detailTemplateFullRow: true,
        detailTemplatePlain: true,
      },
    ];

    return {
      details: [
        {
          status: {
            entryType: group.leaveApplicationType,
            // Days decided differently have no single status; the counts say it.
            approvalStatus: isMixed
              ? buildLeaveStatusChips(group.statusCounts)
                  .map(chip => chip.label)
                  .join(' · ')
              : this.statusLabel(group.records[0].approvalStatus),
          },
          entryData,
          createdBy: {
            user: group.createdByUser,
            date: group.createdAt,
            notes: group.reason,
          },
        },
      ],
      entity: {
        name: `${group.user.firstName} ${group.user.lastName}`,
        subtitle: group.user.employeeId ?? undefined,
      },
    };
  }

  private buildDayWise(
    group: ILeaveGroupGetBaseResponseDto
  ): ILeaveDayWiseView {
    const chips = buildLeaveStatusChips(group.statusCounts);
    return {
      chips,
      segments: chips.map(chip => ({
        status: chip.status,
        count:
          group.statusCounts[chip.status as keyof typeof group.statusCounts],
        color: StatusUtil.getHexColors(this.statusLabel(chip.status)).primary,
      })),
      groups: this.groupByDecision(group.records),
    };
  }

  /** Cards in date order of their first day. */
  private groupByDecision(
    days: ILeaveGetBaseResponseDto[]
  ): ILeaveDecisionGroup[] {
    const groups = new Map<string, ILeaveDecisionGroup>();

    for (const day of days) {
      const status = String(day.approvalStatus).toLowerCase();
      const remark = day.approvalReason?.trim() ?? '';
      const by = day.approvalByUser;
      const key = `${status}|${by?.id ?? ''}|${remark}`;

      const existing = groups.get(key);
      if (existing) {
        existing.dates.push(day.fromDate);
        // The latest decision time of the days in the card.
        if (
          day.approvalAt &&
          existing.decidedBy &&
          (!existing.decidedBy.at ||
            new Date(day.approvalAt) > new Date(existing.decidedBy.at))
        ) {
          existing.decidedBy.at = day.approvalAt;
        }
      } else {
        const name = by
          ? [by.firstName, by.lastName].filter(Boolean).join(' ').trim()
          : '';
        groups.set(key, {
          key,
          statusLabel: this.statusLabel(day.approvalStatus),
          dates: [day.fromDate],
          decidedBy:
            status !== 'pending' && name
              ? {
                  name,
                  avatar: this.avatarService.getAvatarFromName(name),
                  at: day.approvalAt,
                }
              : null,
          remark,
          isPending: status === 'pending',
        });
      }
    }

    return [...groups.values()];
  }
}
