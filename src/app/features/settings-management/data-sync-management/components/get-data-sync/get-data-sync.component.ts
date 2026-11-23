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
import { DatePipe, DecimalPipe } from '@angular/common';
import { finalize, take, timer } from 'rxjs';
import { APP_PERMISSION } from '@core/constants';
import { LoggerService } from '@core/services';
import { AuthService } from '@features/auth-management/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { ICONS } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import {
  EButtonActionType,
  EButtonSeverity,
  IPageHeaderConfig,
} from '@shared/types';
import {
  buildDataSyncConfirmConfig,
  DATA_SYNC_EMAIL_EXAMPLE,
  DATA_SYNC_HEADER_ACTION as SYNC_ACTION,
  DATA_SYNC_LOADER_CONFIG,
  DATA_SYNC_REDIRECT_SECONDS,
  DATA_SYNC_SIGN_IN_BUTTON_CONFIG,
  DATA_SYNC_STEPS,
} from '../../config/data-sync.config';
import { DataSyncService } from '../../services/data-sync.service';
import {
  IDataSyncRunResponseDto,
  IDataSyncStatusResponseDto,
} from '../../types/data-sync.dto';
import {
  IDataSyncResultStat,
  TDataSyncViewState,
} from '../../types/data-sync.interface';

/**
 * One button that replaces UAT data with prod data. The server decides whether it may run
 * (UAT database + flag on); this page only reflects that and asks for confirmation.
 */
@Component({
  selector: 'app-get-data-sync',
  imports: [PageHeaderComponent, ButtonComponent, DatePipe],
  providers: [DecimalPipe],
  templateUrl: './get-data-sync.component.html',
  styleUrl: './get-data-sync.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDataSyncComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataSyncService = inject(DataSyncService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly decimalPipe = inject(DecimalPipe);

  protected readonly steps = DATA_SYNC_STEPS;
  protected readonly emailExample = DATA_SYNC_EMAIL_EXAMPLE;
  protected readonly signInButtonConfig = DATA_SYNC_SIGN_IN_BUTTON_CONFIG;
  protected readonly redirectSeconds = DATA_SYNC_REDIRECT_SECONDS;
  protected readonly redirectIn = signal(DATA_SYNC_REDIRECT_SECONDS);
  private hasRedirected = false;

  protected readonly status = signal<IDataSyncStatusResponseDto | null>(null);
  protected readonly isLoadingStatus = signal(true);
  protected readonly statusLoadFailed = signal(false);
  protected readonly lastRun = signal<IDataSyncRunResponseDto | null>(null);

  protected readonly viewState = computed((): TDataSyncViewState => {
    if (this.lastRun()) {
      return 'done';
    }
    if (this.isLoadingStatus()) {
      return 'loading';
    }
    if (this.statusLoadFailed()) {
      return 'error';
    }
    return this.status()?.available ? 'ready' : 'blocked';
  });

  protected readonly resultStats = computed((): IDataSyncResultStat[] => {
    const run = this.lastRun();
    if (!run) {
      return [];
    }
    return [
      { label: 'Tables copied', value: this.formatNumber(run.tablesCopied) },
      { label: 'Rows copied', value: this.formatNumber(run.rowsCopied) },
      {
        label: 'Time taken',
        value: `${this.formatNumber(run.durationMs / 1000, '1.0-1')} s`,
      },
      {
        label: 'UAT permissions kept',
        value: this.formatNumber(run.permissionsKept ?? 0),
      },
    ];
  });

  protected readonly pageHeaderConfig = computed(() =>
    this.getPageHeaderConfig()
  );

  ngOnInit(): void {
    this.loadStatus();
  }

  protected onHeaderButtonClick(actionName: string): void {
    const status = this.status();
    if (actionName !== SYNC_ACTION || !status?.available || this.lastRun()) {
      return;
    }

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.DOWNLOAD,
      buildDataSyncConfirmConfig(
        status.sourceDatabase ?? 'prod',
        status.targetDatabase,
        () => this.runSync()
      ),
      null,
      false,
      false
    );
  }

  /** The sync replaced every session, so the next request would fail anyway. */
  protected signInAgain(): void {
    // The countdown and the button can both fire; log out only once.
    if (this.hasRedirected) {
      return;
    }
    this.hasRedirected = true;
    this.authService.forceLogout();
  }

  private loadStatus(): void {
    this.isLoadingStatus.set(true);
    this.dataSyncService
      .getStatus()
      .pipe(
        finalize(() => this.isLoadingStatus.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: status => {
          this.status.set(status);
          this.statusLoadFailed.set(false);
        },
        error: () => this.statusLoadFailed.set(true),
      });
  }

  private runSync(): void {
    this.loadingService.show(DATA_SYNC_LOADER_CONFIG);
    this.dataSyncService
      .syncProdToUat()
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: result => {
          this.lastRun.set(result);
          this.logger.logUserAction('Prod to UAT sync completed', result);
          this.notificationService.success(result.message);
          this.startRedirectCountdown();
        },
      });
  }

  /** Shows the result for a moment, counting down, then sends the user to the login page. */
  private startRedirectCountdown(): void {
    this.redirectIn.set(this.redirectSeconds);
    timer(1000, 1000)
      .pipe(take(this.redirectSeconds), takeUntilDestroyed(this.destroyRef))
      .subscribe(tick => {
        const remaining = this.redirectSeconds - tick - 1;
        this.redirectIn.set(remaining);
        if (remaining === 0) {
          this.signInAgain();
        }
      });
  }

  private formatNumber(value: number, digits = '1.0-0'): string {
    return this.decimalPipe.transform(value, digits) ?? String(value);
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    const state = this.viewState();
    const disabledTooltip =
      state === 'loading'
        ? 'Checking whether this server can sync…'
        : state === 'done'
          ? 'Sync finished. Sign in again to continue.'
          : state === 'error'
            ? 'Could not check sync status.'
            : (this.status()?.reason ?? undefined);

    return {
      title: 'Sync from Prod',
      subtitle:
        'Replace UAT data with the latest prod data — logs skipped, contacts masked',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          icon: ICONS.COMMON.DOWNLOAD,
          label: 'Sync now',
          severity: EButtonSeverity.DANGER,
          actionName: SYNC_ACTION,
          permission: [APP_PERMISSION.DATA_SYNC.RUN],
          disabled: state !== 'ready',
          disabledTooltip,
        },
      ],
    };
  }
}
