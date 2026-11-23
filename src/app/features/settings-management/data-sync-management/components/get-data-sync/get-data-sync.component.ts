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
import { finalize } from 'rxjs';
import { APP_PERMISSION } from '@core/constants';
import { LoggerService } from '@core/services';
import { AuthService } from '@features/auth-management/services/auth.service';
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
  DATA_SYNC_HEADER_ACTION as SYNC_ACTION,
  DATA_SYNC_LOADER_CONFIG,
  DATA_SYNC_STEPS,
} from '../../config/data-sync.config';
import { DataSyncService } from '../../services/data-sync.service';
import {
  IDataSyncRunResponseDto,
  IDataSyncStatusResponseDto,
} from '../../types/data-sync.dto';

/**
 * One button that replaces UAT data with prod data. The server decides whether it may run
 * (UAT database + flag on); this page only reflects that and asks for confirmation.
 */
@Component({
  selector: 'app-get-data-sync',
  imports: [PageHeaderComponent, DecimalPipe],
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

  protected readonly steps = DATA_SYNC_STEPS;
  protected readonly status = signal<IDataSyncStatusResponseDto | null>(null);
  protected readonly isLoadingStatus = signal(true);
  protected readonly statusLoadFailed = signal(false);
  protected readonly lastRun = signal<IDataSyncRunResponseDto | null>(null);

  protected readonly pageHeaderConfig = computed(() =>
    this.getPageHeaderConfig()
  );

  ngOnInit(): void {
    this.loadStatus();
  }

  protected onHeaderButtonClick(actionName: string): void {
    const status = this.status();
    if (actionName !== SYNC_ACTION || !status?.available) {
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
          // Every refresh token was replaced by the sync; sign out cleanly instead of failing later.
          this.authService.forceLogout();
        },
      });
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    const status = this.status();
    const disabledTooltip = this.isLoadingStatus()
      ? 'Checking whether this server can sync…'
      : (status?.reason ??
        (this.statusLoadFailed() ? 'Could not check sync status.' : undefined));

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
          disabled: !status?.available,
          disabledTooltip,
        },
      ],
    };
  }
}
