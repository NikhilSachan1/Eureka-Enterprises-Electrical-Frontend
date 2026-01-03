import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import {
  IPetroCardDeleteRequestDto,
  IPetroCardDeleteResponseDto,
  IPetroCardGetBaseResponseDto,
} from '../../types/petro-card.dto';
import { PetroCardService } from '../../services/petro-card.service';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { EButtonActionType } from '@shared/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-petro-card',
  imports: [],
  templateUrl: './delete-petro-card.component.html',
  styleUrl: './delete-petro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletePetroCardComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly petroCardService = inject(PetroCardService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IPetroCardGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete a petro card but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.onSubmit(this.selectedRecord());
  }

  protected onSubmit(record: IPetroCardGetBaseResponseDto[]): void {
    if (this.isSubmitting()) {
      return;
    }

    const formData = this.prepareFormData(record);
    this.executePetroCardDeleteAction(formData);
  }

  private prepareFormData(
    record: IPetroCardGetBaseResponseDto[]
  ): IPetroCardDeleteRequestDto {
    return {
      cardIds: record.map((row: IPetroCardGetBaseResponseDto) => row.id),
    };
  }

  private executePetroCardDeleteAction(
    formData: IPetroCardDeleteRequestDto
  ): void {
    const loadingMessage = {
      title: 'Deleting Petro Card',
      message: 'Please wait while we delete the petro card...',
    };
    this.isSubmitting.set(true);
    this.loadingService.show(loadingMessage);

    this.petroCardService
      .deletePetroCard(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPetroCardDeleteResponseDto) => {
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'petro card',
            actionLabel: EButtonActionType.DELETE,
            errors,
            result,
          });

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
