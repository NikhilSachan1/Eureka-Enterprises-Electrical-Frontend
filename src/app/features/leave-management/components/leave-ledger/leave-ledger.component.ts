import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { LoggerService } from '@core/services';
import { EUserRole } from '@shared/constants';
import {
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { IEnhancedTable, ITableSearchFilterFormConfig } from '@shared/types';
import { applyGroupMetricValueLoading } from '@shared/utility';
import { AuthService } from '@features/auth-management/services/auth.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import {
  LEAVE_LEDGER_NO_EMPLOYEE_STATE,
  LEAVE_LEDGER_PAGE_HEADER,
  LEAVE_LEDGER_TABLE_ENHANCED_CONFIG,
  createLeaveLedgerSearchFilterConfig,
} from '../../config/leave-ledger.config';
import { LeaveLedgerService } from '../../services/leave-ledger.service';
import {
  ILeaveLedgerGetFormDto,
  ILeaveLedgerGetResponseDto,
} from '../../types/leave-ledger.dto';
import { ILeaveLedgerSearchFilterFormDto } from '../../types/leave-ledger.interface';
import {
  buildLeaveLedgerMetricGroups,
  buildLeaveLedgerRows,
} from '../../utils/leave-ledger.util';

/**
 * Leave passbook for one financial year: every credit and debit with the balance after it.
 * Employees and drivers see their own straight away; office roles first pick an employee.
 */
@Component({
  selector: 'app-leave-ledger',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
    EmptyMessagesComponent,
    DecimalPipe,
  ],
  templateUrl: './leave-ledger.component.html',
  styleUrl: './leave-ledger.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveLedgerComponent implements OnInit {
  private readonly leaveLedgerService = inject(LeaveLedgerService);
  private readonly dataTableService = inject(TableService);
  private readonly tableParamsBuilder = inject(
    TableServerSideParamsBuilderService
  );
  private readonly authService = inject(AuthService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pageHeaderConfig = LEAVE_LEDGER_PAGE_HEADER;

  /** Employees and drivers read only their own ledger; everyone else picks an employee first. */
  private readonly readsOwnLedger = [
    EUserRole.EMPLOYEE,
    EUserRole.DRIVER,
  ].includes(this.authService.getCurrentUser()?.activeRole as EUserRole);

  /** No employee picker for employees and drivers. */
  protected readonly searchFilterConfig: ITableSearchFilterFormConfig<ILeaveLedgerSearchFilterFormDto> =
    createLeaveLedgerSearchFilterConfig(!this.readsOwnLedger);

  protected readonly noEmployeeState = LEAVE_LEDGER_NO_EMPLOYEE_STATE;

  protected table!: IEnhancedTable;
  private tableFilterData!: TableLazyLoadEvent;
  private readonly ledger = signal<ILeaveLedgerGetResponseDto | null>(null);

  /** Office roles: no employee picked yet — the table is hidden behind an empty message. */
  protected readonly needsEmployee = signal(!this.readsOwnLedger);

  protected readonly metricGroups = computed(() =>
    this.ledger()
      ? applyGroupMetricValueLoading(
          buildLeaveLedgerMetricGroups(this.ledger()),
          this.table.loading()
        )
      : []
  );

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      LEAVE_LEDGER_TABLE_ENHANCED_CONFIG
    );
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadLedger();
  }

  private loadLedger(): void {
    const params =
      this.tableParamsBuilder.buildQueryParams<ILeaveLedgerGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );
    if (this.readsOwnLedger) {
      delete params.employeeName;
    }

    const needsEmployee = !this.readsOwnLedger && !params.employeeName;
    this.needsEmployee.set(needsEmployee);
    if (needsEmployee) {
      this.ledger.set(null);
      this.table.setData([]);
      return;
    }

    this.table.setLoading(true);
    this.leaveLedgerService
      .getLedger(params)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ledger => {
          this.ledger.set(ledger);
          this.table.updateTableConfig({ totalRecords: ledger.totalRecords });
          this.table.setData(buildLeaveLedgerRows(ledger.records));
          this.logger.logUserAction('Leave ledger loaded');
        },
        error: error => {
          this.ledger.set(null);
          this.table.setLoadError();
          this.logger.logUserAction('Failed to load leave ledger', error);
        },
      });
  }
}
