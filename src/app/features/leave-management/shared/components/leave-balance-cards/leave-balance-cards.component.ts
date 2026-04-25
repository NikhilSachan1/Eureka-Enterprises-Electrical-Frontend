import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { LeaveService } from '@features/leave-management/services/leave.service';
import {
  ILeaveBalanceGetFormDto,
  ILeaveBalanceGetResponseDto,
} from '@features/leave-management/types/leave.dto';
import { LoadingService, NotificationService } from '@shared/services';
import { LoggerService } from '@core/services';

type ILeaveBalanceCardData = ILeaveBalanceGetResponseDto['records'][number];
const DEFAULT_LEAVE_BALANCE: ILeaveBalanceCardData = {
  totalAllocated: '0',
  consumed: '0',
  availableBalance: '0',
};

@Component({
  selector: 'app-leave-balance-cards',
  standalone: true,
  imports: [],
  templateUrl: './leave-balance-cards.component.html',
  styleUrl: './leave-balance-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaveBalanceCardsComponent implements OnInit {
  private readonly leaveService = inject(LeaveService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  leaveBalance = model<ILeaveBalanceCardData | null>(null);
  employeeName = input<string | null>(null);

  private previousEmployeeName: string | null = null;

  constructor() {
    effect(() => {
      const currentEmployeeName = this.employeeName();
      if (currentEmployeeName && typeof currentEmployeeName === 'string') {
        this.loadLeaveBalanceFromApi(currentEmployeeName);
        this.previousEmployeeName = currentEmployeeName;
      } else if (this.previousEmployeeName && !currentEmployeeName) {
        this.leaveBalance.set(null);
        this.previousEmployeeName = null;
      }
    });
  }

  ngOnInit(): void {
    if (this.employeeName()) {
      return;
    }

    const currentBalance = this.leaveBalance();
    if (currentBalance) {
      return;
    }

    this.loadLeaveBalanceFromRoute('leaveBalance');
  }

  private loadLeaveBalanceFromRoute(dataKey: string): void {
    const resolverData = this.activatedRoute.snapshot.data[dataKey] as
      | { records?: ILeaveBalanceCardData[] }
      | null
      | undefined;

    this.applyResolverLikeLeaveBalance(resolverData?.records?.[0] ?? null);
  }

  private applyResolverLikeLeaveBalance(
    resolverData: ILeaveBalanceCardData | null | undefined
  ): void {
    if (!resolverData) {
      this.logger.logUserAction('No leave balance data available in resolver');
      this.leaveBalance.set(DEFAULT_LEAVE_BALANCE);
      this.notificationService.warning(
        'No leave balance found. Showing default balance as 0.'
      );
      return;
    }

    this.leaveBalance.set(resolverData);
    this.notifyIfAvailableBalanceIsZero(resolverData);
  }

  private loadLeaveBalanceFromApi(employeeName: string): void {
    this.loadingService.show({
      title: 'Loading leave balance',
      message: "We're loading leave balance. This will just take a moment.",
    });

    const params: ILeaveBalanceGetFormDto = { employeeName };

    this.leaveService
      .getLeaveBalance(params)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          const balance = response.records?.[0] ?? null;
          if (!balance) {
            this.leaveBalance.set(DEFAULT_LEAVE_BALANCE);
            this.notificationService.warning(
              'No leave balance found for this employee.'
            );
            return;
          }

          this.leaveBalance.set(balance);
          this.notifyIfAvailableBalanceIsZero(balance);
        },
        error: error => {
          this.leaveBalance.set(null);
          this.notificationService.error('Failed to load leave balance.');
          this.logger.error('Failed to load leave balance', error);
        },
      });
  }

  private notifyIfAvailableBalanceIsZero(balance: ILeaveBalanceCardData): void {
    const availableBalance = Number.parseFloat(balance.availableBalance ?? '0');
    if (Number.isFinite(availableBalance) && availableBalance <= 0) {
      this.notificationService.warning(
        'Available leave balance is 0. You cannot apply leave.'
      );
    }
  }
}
