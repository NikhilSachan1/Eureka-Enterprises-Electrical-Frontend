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
import { VehicleService } from '../../services/vehicle.service';
import {
  IvehicleDeleteFormDto,
  IVehicleDeleteResponseDto,
  IVehicleGetBaseResponseDto,
} from '../../types/vehicle.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
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
  private readonly appConfigurationService = inject(AppConfigurationService);

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
    this.handleSubmit();
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
      message: "We're removing the vehicle. This will just take a moment.",
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
          this.notificationService.bulkOperationFromResponse(response, {
            successItemsPath: 'result',
            errorItemsPath: 'errors',
            successMessageKey: 'message',
            errorMessageKey: 'error',
            fallbacks: {
              success: (count: number) =>
                count === 1
                  ? 'Vehicle deleted successfully.'
                  : `Successfully deleted ${count} vehicles.`,
              error: () => 'Failed to delete vehicle.',
              empty: 'Failed to delete vehicle.',
            },
          });

          this.appConfigurationService.refreshVehicleDropdowns();

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to delete vehicle.', error);
          this.notificationService.error('Failed to delete vehicle.');
        },
      });
  }
}
