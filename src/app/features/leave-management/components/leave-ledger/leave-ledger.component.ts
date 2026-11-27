import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
import { AppPermissionService, LoggerService } from '@core/services';
import { FormService } from '@shared/services';
import { IEnhancedForm, ITrackedFields } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import {
  LEAVE_LEDGER_EMPLOYEE_FORM_CONFIG,
  LEAVE_LEDGER_PAGE_HEADER,
} from '../../config/leave-ledger.config';
import { LeaveLedgerService } from '../../services/leave-ledger.service';
import { ILeaveLedgerGetResponseDto } from '../../types/leave-ledger.dto';
import { ILeaveLedgerEmployeeFormDto } from '../../types/leave-ledger.interface';
import {
  buildLeaveMonthRows,
  buildLeaveSummaryCards,
  currentLeaveMonth,
  formatLeaveMonth,
  getLedgerEntryView,
} from '../../utils/leave-ledger.util';

/**
 * Leave passbook: what each month earned from attendance, and every credit and debit with the
 * balance after it. Employees see their own; HR (leave.ledger.view-all) can pick anyone.
 */
@Component({
  selector: 'app-leave-ledger',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    StatusTagComponent,
    ReactiveFormsModule,
    TableModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './leave-ledger.component.html',
  styleUrl: './leave-ledger.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveLedgerComponent implements OnInit {
  private readonly leaveLedgerService = inject(LeaveLedgerService);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pageHeaderConfig = LEAVE_LEDGER_PAGE_HEADER;
  protected readonly dateTimeFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;
  protected readonly canViewAll = this.appPermissionService.hasPermission(
    APP_PERMISSION.LEAVE.LEDGER_VIEW_ALL
  );

  protected employeeForm?: IEnhancedForm<ILeaveLedgerEmployeeFormDto>;
  private trackedFields?: ITrackedFields<ILeaveLedgerEmployeeFormDto>;

  protected readonly loading = signal(false);
  protected readonly loadFailed = signal(false);
  private readonly ledger = signal<ILeaveLedgerGetResponseDto | null>(null);

  /** The picked employee, or null for "my own ledger". */
  private readonly selectedEmployeeId = computed(() => {
    const value = this.trackedFields?.['employeeName']?.();
    return typeof value === 'string' && value ? value : null;
  });

  protected readonly financialYear = computed(
    () => this.ledger()?.financialYear ?? ''
  );
  protected readonly summaryCards = computed(() => {
    const ledger = this.ledger();
    return ledger ? buildLeaveSummaryCards(ledger.summary) : [];
  });
  protected readonly monthRows = computed(() =>
    buildLeaveMonthRows(this.ledger()?.months ?? [], currentLeaveMonth())
  );
  protected readonly entryRows = computed(() =>
    (this.ledger()?.entries ?? []).map(entry => ({
      ...entry,
      view: getLedgerEntryView(entry.entryType),
      periodLabel: entry.periodMonth
        ? formatLeaveMonth(entry.periodMonth.slice(0, 7))
        : null,
      byName: entry.createdBy
        ? `${entry.createdBy.firstName ?? ''} ${entry.createdBy.lastName ?? ''}`.trim()
        : 'System',
    }))
  );

  constructor() {
    effect(() => {
      const userId = this.selectedEmployeeId();
      // Untracked: the load writes signals this effect must not re-run on.
      untracked(() => this.loadLedger(userId));
    });
  }

  ngOnInit(): void {
    if (!this.canViewAll) {
      return;
    }
    this.employeeForm =
      this.formService.createForm<ILeaveLedgerEmployeeFormDto>(
        LEAVE_LEDGER_EMPLOYEE_FORM_CONFIG,
        { destroyRef: this.destroyRef }
      );
    this.trackedFields =
      this.formService.trackMultipleFieldChanges<ILeaveLedgerEmployeeFormDto>(
        this.employeeForm.formGroup,
        ['employeeName'],
        this.destroyRef
      );
  }

  private loadLedger(userId: string | null): void {
    this.loading.set(true);
    this.loadFailed.set(false);

    this.leaveLedgerService
      .getLedger(userId ? { userId } : {})
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ledger => {
          this.ledger.set(ledger);
          this.logger.logUserAction('Leave ledger loaded', { userId });
        },
        error: error => {
          this.ledger.set(null);
          this.loadFailed.set(true);
          this.logger.logUserAction('Failed to load leave ledger', error);
        },
      });
  }
}
