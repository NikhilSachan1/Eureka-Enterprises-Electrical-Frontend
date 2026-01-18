import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ConfirmationDialogService } from '@shared/services';
import { VehicleService } from '../../services/vehicle.service';
import {
  IvehicleDeleteFormDto,
  IVehicleDeleteResponseDto,
  IVehicleGetBaseResponseDto,
} from '../../types/vehicle.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { EButtonActionType } from '@shared/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-delete-vehicle',
  imports: [],
  templateUrl: './delete-vehicle.component.html',
  styleUrl: './delete-vehicle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteVehicleComponent
  extends FormBase<IvehicleDeleteFormDto>
  implements OnInit
{
  private readonly vehicleService = inject(VehicleService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IVehicleGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete vehicle but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeVehicleDeleteAction(formData);
  }

  private prepareFormData(
    record: IVehicleGetBaseResponseDto[]
  ): IvehicleDeleteFormDto {
    return {
      vehicleIds: record.map((row: IVehicleGetBaseResponseDto) => row.id),
    };
  }

  private executeVehicleDeleteAction(formData: IvehicleDeleteFormDto): void {
    const loadingMessage = {
      title: 'Deleting Vehicle',
      message: 'Please wait while we delete the vehicle...',
    };
    this.loadingService.show(loadingMessage);

    this.vehicleService
      .deleteVehicle(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleDeleteResponseDto) => {
          const { errors, result } = response;

          this.notificationService.bulkOperationResult({
            entityLabel: 'vehicle',
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
