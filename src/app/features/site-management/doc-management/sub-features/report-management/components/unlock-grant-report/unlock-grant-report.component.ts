import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ReportService } from '../../services/report.service';
import {
  IUnlockGrantReportResponseDto,
  IReportGetBaseResponseDto,
} from '../../types/report.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unlock-grant-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './unlock-grant-report.component.html',
  styleUrl: './unlock-grant-report.component.scss',
})
export class UnlockGrantReportComponent
  implements OnInit, IDialogActionHandler
{
  private readonly reportService = inject(ReportService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IReportGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private reportId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to grant report unlock but was not provided'
      );
      return;
    }
    this.reportId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.reportId) {
      return;
    }
    this.executeReportUnlockGrantAction(this.reportId);
  }

  private executeReportUnlockGrantAction(reportId: string): void {
    this.loadingService.show({
      title: 'Granting unlock',
      message:
        "We're granting unlock for this report. This will just take a moment.",
    });

    this.reportService
      .unlockGrantReport(reportId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockGrantReportResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to grant report unlock', error);
          this.notificationService.error('Failed to grant report unlock.');
        },
      });
  }
}
