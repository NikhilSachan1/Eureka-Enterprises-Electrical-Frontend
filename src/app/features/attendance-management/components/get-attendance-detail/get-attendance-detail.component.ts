import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { CardModule } from 'primeng/card';
import { IAttendance } from '../../types/attendance.interface';
import { AttendanceService } from '../../services/attendance.service';
import { LoadingService } from '@shared/services/loading.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IAttendanceHistoryGetRequestDto,
  IAttendanceHistoryGetResponseDto,
} from '../../types/attendance.dto';
import { IDrawerDetail, IDrawerEmployeeDetails } from '@shared/models';
import { EDrawerDetailType } from '@shared/types';
import { ViewDetailDrawerComponent } from '@shared/components/view-detail-drawer/view-detail-drawer.component';
import { AppConfigService } from '@core/services';

@Component({
  selector: 'app-get-attendance-detail',
  imports: [CardModule, ViewDetailDrawerComponent],
  templateUrl: './get-attendance-detail.component.html',
  styleUrl: './get-attendance-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAttendanceDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    attendance: IAttendance;
  };
  private readonly attendanceService = inject(AttendanceService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigService = inject(AppConfigService);

  protected readonly _employeeDetails = computed(() =>
    this.getEmployeeDetails()
  );
  protected readonly _attendanceDetails = signal<IDrawerDetail[]>([]);

  protected readonly ALL_DRAWER_DETAIL_TYPES = EDrawerDetailType;

  override onDrawerShow(): void {
    this.loadAttendanceDetails();
  }

  private loadAttendanceDetails(): void {
    this.loadingService.show({
      title: 'Loading Attendance Details',
      message: 'Please wait while we load the attendance details...',
    });

    const paramData = this.prepareParamData();

    this.attendanceService
      .getAttendanceHistory(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceHistoryGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._attendanceDetails.set(mappedData);
          this.logger.logUserAction('Attendance history loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IAttendanceHistoryGetRequestDto {
    return {
      userId: this.drawerData.attendance.employeeId,
      date: this.drawerData.attendance.attendanceDate.split('T')[0],
    };
  }

  private mapDetailData(
    response: IAttendanceHistoryGetResponseDto
  ): IDrawerDetail[] {
    return response.map(record => {
      return {
        employeeDetails: {
          ...this._employeeDetails(),
        },
        status: {
          entryType: record.attendanceType,
          approvalStatus: record.approvalStatus,
        },
        entryData: [
          {
            label: 'Date',
            value: record.attendanceDate,
            type: EDrawerDetailType.DATE,
            format: this.appConfigService.dateFormats.DEFAULT,
          },
          {
            label: 'Check-in',
            value: record.checkInTime,
            type: EDrawerDetailType.TIME,
            format: this.appConfigService.timeFormats.DEFAULT,
          },
          {
            label: 'Check-out',
            value: record.checkOutTime,
            type: EDrawerDetailType.TIME,
            format: this.appConfigService.timeFormats.DEFAULT,
          },
          {
            label: 'Work Duration',
            value: record.workDuration as unknown as string,
            type: EDrawerDetailType.DURATION,
          },
          {
            label: 'Status',
            value: record.status,
            type: EDrawerDetailType.STATUS,
          },
          {
            label: 'Location',
            value: record.notes,
            type: EDrawerDetailType.NOTES,
          },
        ],
        approvalBy: {
          name: `${record.approvalByUser.firstName} ${record.approvalByUser.lastName}`,
          date: record.approvalAt,
          notes: record.approvalComment,
        },
        createdBy: {
          name: `${record.createdByUser.firstName} ${record.createdByUser.lastName}`,
          date: record.createdAt,
        },
      };
    });
  }

  protected getEmployeeDetails(): IDrawerEmployeeDetails {
    const { employeeName, employeeCode } = this.drawerData.attendance;
    return { name: employeeName, employeeCode };
  }
}
