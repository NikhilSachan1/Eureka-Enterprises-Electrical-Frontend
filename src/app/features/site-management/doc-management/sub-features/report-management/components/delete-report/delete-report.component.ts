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
  IDeleteReportResponseDto,
  IReportGetBaseResponseDto,
} from '../../types/report.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-delete-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-report.component.html',
  styleUrl: './delete-report.component.scss',
})
export class DeleteReportComponent implements OnInit, IDialogActionHandler {
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
        'Selected record is required to delete report but was not provided'
      );
      return;
    }
    this.reportId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.reportId) {
      return;
    }
    this.executeDeleteAction(this.reportId);
  }

  private executeDeleteAction(reportId: string): void {
    this.loadingService.show({
      title: 'Deleting report',
      message: "We're removing the report. This will just take a moment.",
    });

    this.reportService
      .deleteReport(reportId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDeleteReportResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete report', error);
          this.notificationService.error('Failed to delete report.');
        },
      });
  }
}
