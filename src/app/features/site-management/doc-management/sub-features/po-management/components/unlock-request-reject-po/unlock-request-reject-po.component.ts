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
import { PoService } from '../../services/po.service';
import {
  IUnlockRejectPoResponseDto,
  IPoGetBaseResponseDto,
} from '../../types/po.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-unlock-request-reject-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './unlock-request-reject-po.component.html',
  styleUrl: './unlock-request-reject-po.component.scss',
})
export class UnlockRequestRejectPoComponent
  implements OnInit, IDialogActionHandler
{
  private readonly poService = inject(PoService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord = input.required<IPoGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private poId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to reject PO unlock request but was not provided'
      );
      return;
    }
    this.poId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.poId) {
      return;
    }
    this.executePoUnlockRequestRejectAction(this.poId);
  }

  private executePoUnlockRequestRejectAction(poId: string): void {
    this.loadingService.show({
      title: 'Rejecting unlock request',
      message:
        "We're rejecting the unlock request for this PO. This will just take a moment.",
    });

    this.poService
      .unlockRequestRejectPo(poId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockRejectPoResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject PO unlock request', error);
          this.notificationService.error('Failed to reject PO unlock request.');
        },
      });
  }
}
