import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { ContractorService } from '../../services/contractor.service';
import {
  IContractorChangeStatusFormDto,
  IContractorChangeStatusResponseDto,
  IContractorGetBaseResponseDto,
} from '../../types/contractor.dto';
import { EContractorStatus } from '../../types/contractor.enum';
import { FORM_VALIDATION_MESSAGES, ICONS } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-change-status-contractor',
  imports: [NgClass],
  templateUrl: './change-status-contractor.component.html',
  styleUrl: './change-status-contractor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeStatusContractorComponent
  extends FormBase
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

  protected readonly ALL_CONTRACTOR_STATUS = EContractorStatus;
  protected readonly ICONS = ICONS;

  protected readonly currentStatus = computed(() => {
    const record = this.selectedRecord();
    return record?.[0].isActive
      ? this.ALL_CONTRACTOR_STATUS.ACTIVE
      : this.ALL_CONTRACTOR_STATUS.ARCHIVED;
  });

  protected readonly newStatus = computed(() => {
    const current = this.currentStatus();
    return current === this.ALL_CONTRACTOR_STATUS.ACTIVE
      ? this.ALL_CONTRACTOR_STATUS.ARCHIVED
      : this.ALL_CONTRACTOR_STATUS.ACTIVE;
  });

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to change status of contractor but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const { id: contractorId } = this.selectedRecord()[0];

    const formData = this.prepareFormData();
    this.executeContractorChangeStatusAction(formData, contractorId);
  }

  private prepareFormData(): IContractorChangeStatusFormDto {
    return {
      contractorStatus: this.newStatus(),
    };
  }

  private executeContractorChangeStatusAction(
    formData: IContractorChangeStatusFormDto,
    contractorId: string
  ): void {
    const loadingMessage = {
      title: 'Changing Contractor Status',
      message: 'Please wait while we change the contractor status...',
    };
    this.loadingService.show(loadingMessage);

    this.contractorService
      .changeContractorStatus(formData, contractorId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (_response: IContractorChangeStatusResponseDto) => {
          this.notificationService.success(
            'Contractor status changed successfully'
          );

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to change contractor status', error);
          this.notificationService.error('Failed to change contractor status');
        },
      });
  }

  protected getStatusLabel(status: string): string {
    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.contractorStatus(),
      status
    );
  }
}
