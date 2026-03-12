import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { CardModule } from 'primeng/card';
import { AttendanceService } from '../../services/attendance.service';
import { LoadingService } from '@shared/services/loading.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IAttendanceGetBaseResponseDto,
  IAttendanceHistoryGetRequestDto,
  IAttendanceHistoryGetResponseDto,
} from '../../types/attendance.dto';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
} from '@shared/types';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { AppConfigurationService } from '@shared/services';
import {
  getMappedValueFromArrayOfObjects,
  stringToArray,
} from '@shared/utility';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-get-attendance-detail',
  imports: [CardModule, ViewDetailComponent],
  templateUrl: './get-attendance-detail.component.html',
  styleUrl: './get-attendance-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAttendanceDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    attendance: IAttendanceGetBaseResponseDto;
  };
  private readonly attendanceService = inject(AttendanceService);
  private readonly loadingService = inject(LoadingService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _attendanceDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

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
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IAttendanceHistoryGetRequestDto {
    return {
      userId: this.drawerData.attendance.user.id,
      date: this.drawerData.attendance.attendanceDate.split('T')[0],
    };
  }

  private mapDetailData(
    response: IAttendanceHistoryGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = response.map(record => {
      const siteLocation = stringToArray(record.notes, '-')[0] || '';
      const clientName = stringToArray(record.notes, '-')[1] || '';

      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Date',
          value: record.attendanceDate,
          type: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Check-in',
          value: record.checkInTime,
          type: EDataType.TIME,
          format: APP_CONFIG.TIME_FORMATS.DEFAULT,
        },
        {
          label: 'Check-out',
          value: record.checkOutTime,
          type: EDataType.TIME,
          format: APP_CONFIG.TIME_FORMATS.DEFAULT,
        },
        {
          label: 'Work Duration',
          value: record.workDuration as unknown as string,
          type: EDataType.DURATION,
        },
        {
          label: 'Status',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.attendanceStatus(),
            record.status
          ),
          type: EDataType.STATUS,
        },
        {
          label: 'Site Location',
          value: siteLocation,
        },
        {
          label: 'Client Name',
          value: clientName,
        },
        {
          label: 'Associate Engineer',
          value: 'John Doe', // TODO: Replace hard-coded name with associate employee name once associate employee mapping is available from backend.
        },
        {
          label: 'Associated Vehicle',
          value: 'Vehicle 1', // TODO: Add associated vehicle once we have the associated vehicle functionality
        },
      ];

      return {
        status: {
          entryType: record.attendanceType,
          approvalStatus: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.approvalStatus(),
            record.approvalStatus
          ),
        },
        entryData,
        approvalBy: {
          user: record.approvalByUser,
          date: record.approvalAt,
          notes: record.approvalComment,
        },
        createdBy: {
          user: record.createdByUser,
          date: record.createdAt,
        },
        updatedBy: {
          user: record.updatedByUser,
          date: record.updatedAt,
        },
      };
    });

    return {
      details: mappedDetails,
      entity: {
        name: `${this.drawerData.attendance.user.firstName} ${this.drawerData.attendance.user.lastName}`,
        subtitle: this.drawerData.attendance.user.employeeId ?? 'N/A',
      },
    };
  }
}
