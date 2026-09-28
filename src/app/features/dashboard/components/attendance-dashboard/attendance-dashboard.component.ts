import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Card } from 'primeng/card';
import { APP_CONFIG } from '@core/config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { dashOutlinedLinkButton } from '@features/dashboard/utils/dashboard-link-button.config';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import type {
  IAttendanceGetBaseResponseDto,
  IAttendanceGetStatsResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import type { IDashboardTodayAttendanceRow } from '@features/dashboard/types/dashboard.interface';
import {
  buildAssignmentTrail,
  compareDashboardAttendanceRows,
  resolveAttendanceTone,
} from '@features/dashboard/utility/attendance-dashboard.util';
import { DEFAULT_INPUT_FIELD_CONFIG } from '@shared/config/input-field.config';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { AppConfigurationService } from '@shared/services';
import { EDataType, IInputFieldsConfig, IOptionDropdown } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

const TODAY_ATTENDANCE_PAGE_SIZE = 200;

@Component({
  selector: 'app-attendance-dashboard',
  imports: [Card, ButtonComponent, InputFieldComponent, DecimalPipe],
  templateUrl: './attendance-dashboard.component.html',
  styleUrl: './attendance-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceDashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly attendanceService = inject(AttendanceService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;
  protected readonly ROUTE_BASE_PATHS = ROUTE_BASE_PATHS;
  protected readonly ROUTES = ROUTES;

  protected readonly openAttendanceButton = dashOutlinedLinkButton({
    label: 'Open attendance',
    icon: ICONS.COMMON.EXTERNAL_LINK,
  });

  protected readonly loading = signal(true);
  protected readonly searchTerm = signal('');
  protected readonly rows = signal<IDashboardTodayAttendanceRow[]>([]);
  protected readonly summary = signal<IAttendanceGetStatsResponseDto | null>(
    null
  );

  protected readonly searchFieldConfig: IInputFieldsConfig = {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.TEXT,
    id: 'dashboard-attendance-search',
    fieldName: 'dashboardAttendanceSearch',
    label: 'Search employee',
    placeholder: 'Search by name',
  } as IInputFieldsConfig;

  protected readonly filteredRows = computed(
    (): IDashboardTodayAttendanceRow[] => {
      const keyword = this.searchTerm().trim().toLowerCase();
      const rows = this.rows();
      if (!keyword) {
        return rows;
      }

      return rows.filter((row): boolean => row.searchText.includes(keyword));
    }
  );

  ngOnInit(): void {
    this.loadTodayAttendance();
  }

  protected onSearchFieldChange(value: unknown): void {
    this.searchTerm.set(String(value ?? ''));
  }

  protected navigateTo(paths: string[]): void {
    void this.router.navigate(paths);
  }

  private loadTodayAttendance(): void {
    this.loading.set(true);
    const today = new Date();
    this.loadTodayPage(1, [], [today, today]);
  }

  private loadTodayPage(
    page: number,
    accumulated: IAttendanceGetBaseResponseDto[],
    attendanceDate: [Date, Date]
  ): void {
    this.attendanceService
      .getAttendanceList({
        attendanceDate,
        page,
        pageSize: TODAY_ATTENDANCE_PAGE_SIZE,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          accumulated.push(...response.records);

          if (page === 1) {
            this.summary.set(response.stats);
          }

          this.publishRows(accumulated);
          this.loading.set(false);

          const hasMore =
            response.records.length > 0 &&
            accumulated.length < response.totalRecords;

          if (hasMore) {
            this.loadTodayPage(page + 1, accumulated, attendanceDate);
          }
        },
        error: () => {
          if (accumulated.length === 0) {
            this.rows.set([]);
            this.summary.set(null);
          }
          this.loading.set(false);
        },
      });
  }

  private publishRows(records: readonly IAttendanceGetBaseResponseDto[]): void {
    const statusOptions = this.appConfigurationService.attendanceStatus();
    const rows = records.map(record => this.mapTodayRow(record, statusOptions));
    rows.sort(compareDashboardAttendanceRows);
    this.rows.set(rows);
  }

  private mapTodayRow(
    record: IAttendanceGetBaseResponseDto,
    statusOptions: IOptionDropdown[]
  ): IDashboardTodayAttendanceRow {
    const mappedStatus =
      record.status === EAttendanceStatus.APPROVAL_PENDING
        ? 'Approval Pending'
        : String(
            getMappedValueFromArrayOfObjects(statusOptions, record.status) ??
              record.status
          );

    const assignmentTrail = buildAssignmentTrail(record);
    const employeeName =
      `${record.user.firstName} ${record.user.lastName}`.trim();
    const employeeCode = record.user.employeeId ?? '';
    const assignmentSearchText = assignmentTrail
      .map(stop => stop.value)
      .join(' ');

    return {
      id: record.id,
      employeeName,
      employeeCode,
      assignmentTrail,
      searchText:
        `${employeeName} ${employeeCode} ${assignmentSearchText} ${mappedStatus} ${record.status}`.toLowerCase(),
      attendanceStatus: mappedStatus,
      statusKey: record.status,
      statusTone: resolveAttendanceTone(record.status),
    };
  }
}
