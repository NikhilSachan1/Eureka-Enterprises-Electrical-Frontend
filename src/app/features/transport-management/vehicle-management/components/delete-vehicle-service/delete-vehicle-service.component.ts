import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IvehicleServiceDeleteFormDto,
  IVehicleServiceDeleteResponseDto,
  IVehicleServiceGetBaseResponseDto,
} from '../../types/vehicle-service.dto';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import { ConfirmationDialogService } from '@shared/services';
import { VehicleServiceService } from '../../services/vehicle-service.service';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-delete-vehicle-service',
  imports: [],
  templateUrl: './delete-vehicle-service.component.html',
  styleUrl: './delete-vehicle-service.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteVehicleServiceComponent
  extends FormBase<IvehicleServiceDeleteFormDto>
  implements IDialogActionHandler, OnInit
{
  private readonly vehicleServiceService = inject(VehicleServiceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IVehicleServiceGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete vehicle service but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeVehicleServiceDeleteAction(formData);
  }

  private prepareFormData(
    record: IVehicleServiceGetBaseResponseDto[]
  ): IvehicleServiceDeleteFormDto {
    return {
      vehicleServiceIds: record.map(
        (row: IVehicleServiceGetBaseResponseDto) => row.id
      ),
    };
  }

  private executeVehicleServiceDeleteAction(
    formData: IvehicleServiceDeleteFormDto
  ): void {
    const loadingMessage = {
      title: 'Deleting Vehicle Service',
      message: 'Please wait while we delete the vehicle service...',
    };
    this.loadingService.show(loadingMessage);

    this.vehicleServiceService
      .deleteVehicleService(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleServiceDeleteResponseDto) => {
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'vehicle service',
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
