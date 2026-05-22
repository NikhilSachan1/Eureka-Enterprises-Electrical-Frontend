import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { DsrService } from '../../services/dsr.service';
import {
  IDsrDeleteResponseDto,
  IDsrGetBaseResponseDto,
} from '../../types/dsr.dto';

@Component({
  selector: 'app-delete-dsr',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-dsr.component.html',
  styleUrl: './delete-dsr.component.scss',
})
export class DeleteDsrComponent implements OnInit, IDialogActionHandler {
  private readonly dsrService = inject(DsrService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IDsrGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private dsrId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete DSR but was not provided'
      );
      return;
    }
    this.dsrId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.dsrId) {
      return;
    }
    this.executeDsrDeleteAction(this.dsrId);
  }

  private executeDsrDeleteAction(dsrId: string): void {
    this.loadingService.show({
      title: 'Deleting DSR',
      message: "We're removing the DSR. This will just take a moment.",
    });

    this.dsrService
      .deleteDsr(dsrId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrDeleteResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete DSR', error);
          this.notificationService.error('Failed to delete DSR.');
        },
      });
  }
}
