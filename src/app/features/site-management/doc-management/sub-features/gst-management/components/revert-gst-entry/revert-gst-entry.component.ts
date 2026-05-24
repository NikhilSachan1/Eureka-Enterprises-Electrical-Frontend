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
  IRevertGstEntryResponseDto,
} from '../../types/gst.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-revert-gst-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './revert-gst-entry.component.html',
  styleUrl: './revert-gst-entry.component.scss',
})
export class RevertGstEntryComponent implements OnInit, IDialogActionHandler {
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
        'Selected record is required to revert GST entry but was not provided'
      );
      return;
    }
    this.gstEntryId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.gstEntryId) {
      return;
    }
    this.executeRevertAction(this.gstEntryId);
  }

  private executeRevertAction(gstEntryId: string): void {
    this.loadingService.show({
      title: 'Rejecting verification',
      message:
        "We're reverting verification for this entry. This will just take a moment.",
    });

    this.gstService
      .revertGstEntry(gstEntryId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRevertGstEntryResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject GST entry verification', error);
          this.notificationService.error(
            'Failed to reject GST entry verification.'
          );
        },
      });
  }
}
