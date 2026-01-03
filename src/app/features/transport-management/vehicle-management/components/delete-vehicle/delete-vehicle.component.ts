import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { VehicleService } from '../../services/vehicle.service';
import { LoggerService } from '@core/services';
import {
  IVehicleDeleteRequestDto,
  IVehicleDeleteResponseDto,
  IVehicleGetBaseResponseDto,
} from '../../types/vehicle.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { EButtonActionType } from '@shared/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-vehicle',
  imports: [],
  templateUrl: './delete-vehicle.component.html',
  styleUrl: './delete-vehicle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteVehicleComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);
  private readonly vehicleService = inject(VehicleService);
  private readonly logger = inject(LoggerService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IVehicleGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected readonly isSubmitting = signal(false);

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
    this.onSubmit(this.selectedRecord());
  }

  protected onSubmit(record: IVehicleGetBaseResponseDto[]): void {
    if (this.isSubmitting()) {
      return;
    }

    const formData = this.prepareFormData(record);
    this.executeVehicleDeleteAction(formData);
  }

  private prepareFormData(
    record: IVehicleGetBaseResponseDto[]
  ): IVehicleDeleteRequestDto {
    return {
      vehicleIds: record.map((row: IVehicleGetBaseResponseDto) => row.id),
    };
  }

  private executeVehicleDeleteAction(formData: IVehicleDeleteRequestDto): void {
    const loadingMessage = {
      title: 'Deleting Vehicle',
      message: 'Please wait while we delete the vehicle...',
    };
    this.isSubmitting.set(true);
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
