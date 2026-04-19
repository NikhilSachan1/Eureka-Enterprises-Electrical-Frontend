import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IContractorDeleteFormDto,
  IContractorDeleteResponseDto,
  IContractorGetBaseResponseDto,
} from '../../types/contractor.dto';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { ContractorService } from '../../services/contractor.service';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { EButtonActionType } from '@shared/types';

@Component({
  selector: 'app-delete-contractor',
  imports: [],
  templateUrl: './delete-contractor.component.html',
  styleUrl: './delete-contractor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteContractorComponent
  extends FormBase<IContractorDeleteFormDto>
  implements OnInit
{
  private readonly contractorService = inject(ContractorService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<IContractorGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete contractor but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeContractorDeleteAction(formData);
  }

  private prepareFormData(
    record: IContractorGetBaseResponseDto[]
  ): IContractorDeleteFormDto {
    return {
      contractorIds: record.map((row: IContractorGetBaseResponseDto) => row.id),
    };
  }

  private executeContractorDeleteAction(
    formData: IContractorDeleteFormDto
  ): void {
    const loadingMessage = {
      title: 'Deleting Contractor',
      message: "We're removing the contractor. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.contractorService
      .deleteContractor(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IContractorDeleteResponseDto) => {
          this.notificationService.bulkOperationFromApiResponse(
            response,
            'contractor',
            EButtonActionType.DELETE
          );

          this.appConfigurationService.refreshContractorDropdowns();

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
