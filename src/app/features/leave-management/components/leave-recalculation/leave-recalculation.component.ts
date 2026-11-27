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
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { EButtonActionType } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import {
  buildLeaveRecalculationApplyDialog,
  createLeaveRecalculationPageHeader,
  LEAVE_LEDGER_LOADING,
  LEAVE_RECALCULATION_APPLY_ACTION,
} from '../../config/leave-ledger.config';
import { LeaveLedgerService } from '../../services/leave-ledger.service';
import { ILeaveRecalculationResponseDto } from '../../types/leave-ledger.dto';
import { formatLeaveMonth } from '../../utils/leave-ledger.util';

/**
 * One-time review of the old monthly credit: what each employee was credited against what their
 * attendance earned, and the correction that would be posted. HR applies it from here.
 */
@Component({
  selector: 'app-leave-recalculation',
  imports: [PageHeaderComponent, StatusTagComponent, TableModule, DecimalPipe],
  templateUrl: './leave-recalculation.component.html',
  styleUrl: './leave-recalculation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveRecalculationComponent implements OnInit {
  private readonly leaveLedgerService = inject(LeaveLedgerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly report = signal<ILeaveRecalculationResponseDto | null>(
    null
  );

  protected readonly rows = computed(() => this.report()?.rows ?? []);
  protected readonly pendingRows = computed(() =>
    this.rows().filter(row => !row.applied && row.difference !== 0)
  );
  protected readonly coveredThroughLabel = computed(() => {
    const month = this.report()?.coveredThrough;
    return month ? formatLeaveMonth(month) : '';
  });
  protected readonly totals = computed(() =>
    this.pendingRows().reduce(
      (sum, row) => ({
        overCredited: sum.overCredited + Math.max(0, -row.difference),
        underCredited: sum.underCredited + Math.max(0, row.difference),
        excessUsed: sum.excessUsed + row.excessUsed,
      }),
      { overCredited: 0, underCredited: 0, excessUsed: 0 }
    )
  );
  protected readonly pageHeaderConfig = computed(() =>
    createLeaveRecalculationPageHeader(
      this.report()?.canApply ?? false,
      this.pendingRows().length
    )
  );

  ngOnInit(): void {
    this.loadReport();
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName !== LEAVE_RECALCULATION_APPLY_ACTION) {
      return;
    }
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.APPROVE,
      buildLeaveRecalculationApplyDialog(this.pendingRows().length, () =>
        this.applyCorrection()
      ),
      null
    );
  }

  private loadReport(): void {
    this.loading.set(true);
    this.leaveLedgerService
      .getRecalculation()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: report => this.report.set(report),
        error: error => {
          this.report.set(null);
          this.logger.logUserAction(
            'Failed to load leave recalculation',
            error
          );
        },
      });
  }

  private applyCorrection(): void {
    const report = this.report();
    if (!report) {
      return;
    }
    this.loadingService.show(LEAVE_LEDGER_LOADING.APPLY);
    this.leaveLedgerService
      .applyRecalculation({ financialYear: report.financialYear })
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: updated => {
          this.report.set(updated);
          this.notificationService.success('Leave balances corrected.');
        },
        error: error => {
          this.logger.logUserAction(
            'Failed to apply leave recalculation',
            error
          );
        },
      });
  }
}
