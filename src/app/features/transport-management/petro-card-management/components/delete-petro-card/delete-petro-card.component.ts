import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import {
  IPetroCardDeleteFormDto,
  IPetroCardDeleteResponseDto,
  IPetroCardGetBaseResponseDto,
} from '../../types/petro-card.dto';
import { PetroCardService } from '../../services/petro-card.service';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { EButtonActionType } from '@shared/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-delete-petro-card',
  imports: [],
  templateUrl: './delete-petro-card.component.html',
  styleUrl: './delete-petro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletePetroCardComponent
  extends FormBase<IPetroCardDeleteFormDto>
  implements OnInit
{
  private readonly petroCardService = inject(PetroCardService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  protected readonly selectedRecord =
    input.required<IPetroCardGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

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
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executePetroCardDeleteAction(formData);
  }
  private prepareFormData(
    record: IPetroCardGetBaseResponseDto[]
  ): IPetroCardDeleteFormDto {
    return {
      petroCardIds: record.map((row: IPetroCardGetBaseResponseDto) => row.id),
    };
  }

  private executePetroCardDeleteAction(
    formData: IPetroCardDeleteFormDto
  ): void {
    const loadingMessage = {
      title: 'Deleting Petro Card',
      message: 'Please wait while we delete the petro card...',
    };
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

          this.appConfigurationService.refreshPetroCardDropdowns();

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
