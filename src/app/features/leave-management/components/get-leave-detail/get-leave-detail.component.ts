import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { AppConfigurationService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { ILeaveGetBaseResponseDto } from '../../types/leave.dto';

@Component({
  selector: 'app-get-leave-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-leave-detail.component.html',
  styleUrl: './get-leave-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetLeaveDetailComponent extends DrawerDetailBase {
  private readonly drawerData = inject(DRAWER_DATA) as {
    leave: ILeaveGetBaseResponseDto;
  };
  private readonly appConfigurationService = inject(AppConfigurationService);

  /** Built only from the row passed into the drawer — no detail API. */
  protected readonly leaveDetails: IDataViewDetailsWithEntity =
    this.buildLeaveDetails(this.drawerData.leave);

  private buildLeaveDetails(
    leave: ILeaveGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Leave Date',
        value: [leave.fromDate, leave.toDate],
        type: EDataType.RANGE,
        dataType: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
    ];

    return {
      details: [
        {
          status: {
            entryType: leave.leaveApplicationType,
            approvalStatus: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.approvalStatus(),
              leave.approvalStatus
            ),
          },
          entryData,
          approvalBy: leave.approvalByUser
            ? {
                user: leave.approvalByUser,
                date: leave.approvalAt,
                notes: leave.approvalReason,
              }
            : undefined,
          createdBy: {
            user: leave.createdByUser,
            date: leave.createdAt,
            notes: leave.reason,
          },
        },
      ],
      entity: {
        name: `${leave.user.firstName} ${leave.user.lastName}`,
        subtitle: leave.user.employeeId ?? undefined,
      },
    };
  }
}
