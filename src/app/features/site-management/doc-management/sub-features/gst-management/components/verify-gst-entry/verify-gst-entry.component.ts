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
import { GstService } from '../../services/gst.service';
import {
  IGstEntryGetBaseResponseDto,
  IVerifyGstEntryResponseDto,
} from '../../types/gst.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-verify-gst-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './verify-gst-entry.component.html',
  styleUrl: './verify-gst-entry.component.scss',
})
export class VerifyGstEntryComponent implements OnInit, IDialogActionHandler {
  private readonly gstService = inject(GstService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IGstEntryGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private gstEntryId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to verify GST entry but was not provided'
      );
      return;
    }
    this.gstEntryId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.gstEntryId) {
      return;
    }
    this.executeVerifyAction(this.gstEntryId);
  }

  private executeVerifyAction(gstEntryId: string): void {
    this.loadingService.show({
      title: 'Approving GST entry',
      message:
        "We're marking this entry as verified. This will just take a moment.",
    });

    this.gstService
      .verifyGstEntry(gstEntryId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVerifyGstEntryResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to approve GST entry', error);
          this.notificationService.error('Failed to approve GST entry.');
        },
      });
  }
}
