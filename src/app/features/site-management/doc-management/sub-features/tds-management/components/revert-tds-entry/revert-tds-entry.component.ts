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
import { TdsService } from '../../services/tds.service';
import {
  ITdsEntryGetBaseResponseDto,
  IRevertTdsEntryResponseDto,
} from '../../types/tds.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-revert-tds-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './revert-tds-entry.component.html',
  styleUrl: './revert-tds-entry.component.scss',
})
export class RevertTdsEntryComponent implements OnInit, IDialogActionHandler {
  private readonly tdsService = inject(TdsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<ITdsEntryGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private tdsEntryId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to revert TDS entry but was not provided'
      );
      return;
    }
    this.tdsEntryId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.tdsEntryId) {
      return;
    }
    this.executeRevertAction(this.tdsEntryId);
  }

  private executeRevertAction(tdsEntryId: string): void {
    this.loadingService.show({
      title: 'Rejecting verification',
      message:
        "We're reverting verification for this entry. This will just take a moment.",
    });

    this.tdsService
      .revertTdsEntry(tdsEntryId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRevertTdsEntryResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject TDS entry verification', error);
          this.notificationService.error(
            'Failed to reject TDS entry verification.'
          );
        },
      });
  }
}
