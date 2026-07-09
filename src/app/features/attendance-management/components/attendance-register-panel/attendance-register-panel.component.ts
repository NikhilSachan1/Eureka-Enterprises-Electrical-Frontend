import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  expand,
  finalize,
  forkJoin,
  map,
  Observable,
  reduce,
} from 'rxjs';
import { EmployeeService } from '@features/employee-management/services/employee.service';
import {
  IEmployeeGetBaseResponseDto,
  IEmployeeGetResponseDto,
} from '@features/employee-management/types/employee.dto';
import { EEmployeeStatus } from '@features/employee-management/types/employee.types';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { TableService } from '@shared/services';
import { IDataTableHeaderConfig, IEnhancedTable } from '@shared/types';
import { AttendanceService } from '../../services/attendance.service';
import {
  IAttendanceGetBaseResponseDto,
  IAttendanceGetResponseDto,
} from '../../types/attendance.dto';
import {
  IAttendanceRegisterCell,
  IAttendanceRegisterReport,
} from '../../types/attendance-register.interface';
import {
  ATTENDANCE_REGISTER_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_ATTENDANCE_REGISTER_FORM_CONFIG,
} from '../../config';
import {
  buildAttendanceRegisterReport,
  getCurrentRegisterMonth,
  getMonthDateRange,
  getRegisterSummaryTone,
  REGISTER_PAGE_SIZE,
} from '../../utility/attendance-register.util';
import {
  buildAttendanceRegisterTableHeaders,
  mapAttendanceRegisterToTableData,
} from '../../utility/attendance-register-table.util';

@Component({
  selector: 'app-attendance-register-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchFilterComponent, DataTableComponent],
  templateUrl: './attendance-register-panel.component.html',
  styleUrl: './attendance-register-panel.component.scss',
})
export class AttendanceRegisterPanelComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly attendanceService = inject(AttendanceService);
  private readonly employeeService = inject(EmployeeService);
  private readonly tableService = inject(TableService);

  protected readonly report = signal<IAttendanceRegisterReport | null>(null);
  protected readonly loading = signal(false);
  protected readonly table: IEnhancedTable = this.tableService.createTable(
    ATTENDANCE_REGISTER_TABLE_ENHANCED_CONFIG
  );
  protected readonly searchFilterConfig =
    SEARCH_FILTER_ATTENDANCE_REGISTER_FORM_CONFIG;
  protected readonly filterPrefillValues = {
    monthYear: getCurrentRegisterMonth(),
  };
  protected readonly getSummaryTone = getRegisterSummaryTone;

  ngOnInit(): void {
    this.loadReport(getCurrentRegisterMonth());
  }

  protected getRegisterCell(
    row: Record<string, unknown>,
    column: IDataTableHeaderConfig
  ): IAttendanceRegisterCell | null {
    const value = row[column.field];
    if (!value || typeof value !== 'object' || !('code' in value)) {
      return null;
    }

    return value as IAttendanceRegisterCell;
  }

  protected onFilterSubmit(data: Record<string, unknown>): void {
    const { monthYear } = data;
    if (monthYear instanceof Date) {
      this.loadReport(monthYear);
    }
  }

  protected onFilterReset(): void {
    this.setReport(null);
  }

  private loadReport(monthYear: Date): void {
    const { start, end } = getMonthDateRange(monthYear);
    this.loading.set(true);

    forkJoin({
      employees: this.fetchAllPages<
        IEmployeeGetResponseDto,
        IEmployeeGetBaseResponseDto
      >(page =>
        this.employeeService.getEmployeeList({
          employeeStatus: EEmployeeStatus.ACTIVE,
          page,
          pageSize: REGISTER_PAGE_SIZE,
        })
      ),
      attendance: this.fetchAllPages<
        IAttendanceGetResponseDto,
        IAttendanceGetBaseResponseDto
      >(page =>
        this.attendanceService.getAttendanceList({
          attendanceDate: [start, end],
          page,
          pageSize: REGISTER_PAGE_SIZE,
        })
      ),
    })
      .pipe(
        map(({ employees, attendance }) =>
          buildAttendanceRegisterReport(employees, attendance, monthYear)
        ),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: report => this.setReport(report),
        error: () => this.setReport(null),
      });
  }

  private setReport(report: IAttendanceRegisterReport | null): void {
    this.report.set(report);

    if (!report) {
      this.table.updateHeaders([]);
      this.table.setData([]);
      return;
    }

    this.table.updateHeaders(buildAttendanceRegisterTableHeaders(report));
    this.table.setData(mapAttendanceRegisterToTableData(report));
  }

  private fetchAllPages<T extends { totalRecords: number; records: R[] }, R>(
    fetchPage: (page: number) => Observable<T>
  ): Observable<R[]> {
    return fetchPage(1).pipe(
      expand((response, index) => {
        const currentPage = index + 1;
        if (currentPage * REGISTER_PAGE_SIZE >= response.totalRecords) {
          return EMPTY;
        }
        return fetchPage(currentPage + 1);
      }),
      map(response => response.records),
      reduce((all, records) => all.concat(records), [] as R[])
    );
  }
}
