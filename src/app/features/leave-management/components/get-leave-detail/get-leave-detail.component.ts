import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AppConfigService } from '@core/services/app-config.service';
import { ILeave } from '@features/leave-management/types/leave.interface';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { ViewDetailDrawerComponent } from '@shared/components/view-detail-drawer/view-detail-drawer.component';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  IDrawerDetail,
  IDrawerEmployeeDetails,
} from '@shared/types/drawer/drawer.interface';
import { EDrawerDetailType } from '@shared/types';
import { toLowerCase } from '@shared/utility';

@Component({
  selector: 'app-get-leave-detail',
  imports: [ViewDetailDrawerComponent],
  templateUrl: './get-leave-detail.component.html',
  styleUrl: './get-leave-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetLeaveDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    leave: ILeave;
  };
  protected readonly appConfigService = inject(AppConfigService);

  protected readonly _employeeDetails = computed(() =>
    this.getEmployeeDetails()
  );
  protected readonly _leaveDetails = signal<IDrawerDetail[]>([]);

  protected readonly ALL_DRAWER_DETAIL_TYPES = EDrawerDetailType;

  override onDrawerShow(): void {
    this.loadLeaveDetails();
  }

  private loadLeaveDetails(): void {
    const mappedData = this.mapDetailData(this.drawerData.leave);
    this._leaveDetails.set(mappedData);
  }

  private mapDetailData(response: ILeave): IDrawerDetail[] {
    return [
      {
        employeeDetails: {
          ...this._employeeDetails(),
        },
        status: {
          approvalStatus: toLowerCase(response.approvalStatus),
          entryType: toLowerCase(response.leaveApplicationType),
        },
        entryData: [
          {
            label: 'From Date',
            value: response.fromDate,
            type: EDrawerDetailType.DATE,
            format: this.appConfigService.dateFormats.DEFAULT,
          },
          {
            label: 'To Date',
            value: response.toDate,
            type: EDrawerDetailType.DATE,
            format: this.appConfigService.dateFormats.DEFAULT,
          },
          {
            label: 'Reason',
            value: response.reason,
            type: EDrawerDetailType.NOTES,
          },
        ],
        approvalBy: {
          name: response.approvalByUser,
          date: response.approvalAt,
          notes: response.approvalReason,
        },
        createdBy: {
          name: response.createdByUser,
          date: response.createdAt,
        },
      },
    ];
  }

  protected getEmployeeDetails(): IDrawerEmployeeDetails {
    const { employeeName, employeeCode } = this.drawerData.leave;
    return { name: employeeName, employeeCode: employeeCode ?? '' };
  }
}
