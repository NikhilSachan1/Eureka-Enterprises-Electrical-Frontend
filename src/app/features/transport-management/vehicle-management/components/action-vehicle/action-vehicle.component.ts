import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ConfirmationDialogService } from '@shared/services';
import {
  EButtonActionType,
  ETableActionTypeValue,
  IDialogActionHandler,
} from '@shared/types';
import { VehicleService } from '../../services/vehicle.service';
import {
  IvehicleActionFormDto,
  IVehicleActionResponseDto,
  IvehicleActionUIFormDto,
  IVehicleGetBaseResponseDto,
} from '../../types/vehicle.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ACTION_VEHICLE_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-action-vehicle',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './action-vehicle.component.html',
  styleUrl: './action-vehicle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionVehicleComponent
  extends FormBase<IvehicleActionUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly vehicleService = inject(VehicleService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IVehicleGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm<IvehicleActionUIFormDto>(
      ACTION_VEHICLE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          actionType,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeVehicleAction(formData);
  }

  private prepareFormData(): IvehicleActionFormDto {
    const formData = this.form.getData();

    let actionTypeValue!: ETableActionTypeValue;

    if (this.dialogActionType() === EButtonActionType.HANDOVER_INITIATE) {
      actionTypeValue = ETableActionTypeValue.HANDOVER_INITIATED;
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_ACCEPTED
    ) {
      actionTypeValue = ETableActionTypeValue.HANDOVER_ACCEPTED;
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_REJECTED
    ) {
      actionTypeValue = ETableActionTypeValue.HANDOVER_REJECTED;
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_CANCELLED
    ) {
      actionTypeValue = ETableActionTypeValue.HANDOVER_CANCELLED;
    } else if (this.dialogActionType() === EButtonActionType.DEALLOCATE) {
      actionTypeValue = ETableActionTypeValue.DEALLOCATED;
    }

    const { id: vehicleId } = this.selectedRecord()[0];
    return {
      ...formData,
      vehicleId,
      actionType: actionTypeValue,
    };
  }

  private executeVehicleAction(formData: IvehicleActionFormDto): void {
    let loadingMessage;

    if (this.dialogActionType() === EButtonActionType.HANDOVER_INITIATE) {
      loadingMessage = {
        title: 'Initiating Handover',
        message: 'Please wait while we initiate the handover...',
      };
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_ACCEPTED
    ) {
      loadingMessage = {
        title: 'Accepting Handover',
        message: 'Please wait while we accept the handover...',
      };
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_REJECTED
    ) {
      loadingMessage = {
        title: 'Rejecting Handover',
        message: 'Please wait while we reject the handover...',
      };
    } else if (
      this.dialogActionType() === EButtonActionType.HANDOVER_CANCELLED
    ) {
      loadingMessage = {
        title: 'Cancelling Handover',
        message: 'Please wait while we cancel the handover...',
      };
    } else if (this.dialogActionType() === EButtonActionType.DEALLOCATE) {
      loadingMessage = {
        title: 'Deallocating Vehicle',
        message: 'Please wait while we deallocate the vehicle...',
      };
    }

    this.loadingService.show(loadingMessage);
    this.form.disable();

    this.vehicleService
      .actionVehicle(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVehicleActionResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
