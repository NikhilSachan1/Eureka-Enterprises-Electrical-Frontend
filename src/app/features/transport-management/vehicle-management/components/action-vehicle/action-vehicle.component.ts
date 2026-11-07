import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
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
import {
  ACTION_VEHICLE_FORM_CONFIG,
  isVehicleReturnPending,
} from '../../config';
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
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<IVehicleGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;

  private static readonly LOADING_MESSAGES: Partial<
    Record<ETableActionTypeValue, { title: string; message: string }>
  > = {
    [ETableActionTypeValue.HANDOVER_INITIATED]: {
      title: 'Initiating Handover',
      message: "We're starting the handover. This will just take a moment.",
    },
    [ETableActionTypeValue.HANDOVER_ACCEPTED]: {
      title: 'Accepting Handover',
      message: "We're accepting the handover. This will just take a moment.",
    },
    [ETableActionTypeValue.HANDOVER_REJECTED]: {
      title: 'Rejecting Handover',
      message: "We're rejecting the handover. This will just take a moment.",
    },
    [ETableActionTypeValue.HANDOVER_CANCELLED]: {
      title: 'Cancelling Handover',
      message: "We're cancelling the handover. This will just take a moment.",
    },
    [ETableActionTypeValue.RETURN_INITIATED]: {
      title: 'Starting return',
      message:
        "We're sending the return request to the office. This will just take a moment.",
    },
    [ETableActionTypeValue.RETURN_ACCEPTED]: {
      title: 'Accepting return',
      message: "We're accepting the return. This will just take a moment.",
    },
    [ETableActionTypeValue.RETURN_REJECTED]: {
      title: 'Rejecting return',
      message: "We're rejecting the return. This will just take a moment.",
    },
    [ETableActionTypeValue.RETURN_CANCELLED]: {
      title: 'Cancelling return',
      message: "We're cancelling the return. This will just take a moment.",
    },
    [ETableActionTypeValue.DEALLOCATED]: {
      title: 'Deallocating Vehicle',
      message: "We're deallocating the vehicle. This will just take a moment.",
    },
  };

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to perform action on vehicle but was not provided'
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

    const { id: vehicleId } = this.selectedRecord()[0];
    return {
      ...formData,
      vehicleId,
      actionType: this.resolveActionTypeValue(),
    };
  }

  /** Accept, reject and cancel are shared with handover: on a pending return they send the return event instead. */
  private resolveActionTypeValue(): ETableActionTypeValue {
    const forReturn = isVehicleReturnPending(this.selectedRecord()[0]);
    const actionTypeValues: Partial<
      Record<EButtonActionType, ETableActionTypeValue>
    > = {
      [EButtonActionType.HANDOVER_INITIATE]:
        ETableActionTypeValue.HANDOVER_INITIATED,
      [EButtonActionType.RETURN_TO_OFFICE]:
        ETableActionTypeValue.RETURN_INITIATED,
      [EButtonActionType.HANDOVER_ACCEPTED]: forReturn
        ? ETableActionTypeValue.RETURN_ACCEPTED
        : ETableActionTypeValue.HANDOVER_ACCEPTED,
      [EButtonActionType.HANDOVER_REJECTED]: forReturn
        ? ETableActionTypeValue.RETURN_REJECTED
        : ETableActionTypeValue.HANDOVER_REJECTED,
      [EButtonActionType.HANDOVER_CANCELLED]: forReturn
        ? ETableActionTypeValue.RETURN_CANCELLED
        : ETableActionTypeValue.HANDOVER_CANCELLED,
      [EButtonActionType.DEALLOCATE]: ETableActionTypeValue.DEALLOCATED,
    };

    return actionTypeValues[this.dialogActionType()] as ETableActionTypeValue;
  }

  private executeVehicleAction(formData: IvehicleActionFormDto): void {
    const loadingMessage =
      ActionVehicleComponent.LOADING_MESSAGES[
        formData.actionType as ETableActionTypeValue
      ];

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
          const action = this.dialogActionType();
          // Covers an accepted return as well: it shares the accept button and frees the holder.
          if (
            action === EButtonActionType.HANDOVER_ACCEPTED ||
            action === EButtonActionType.DEALLOCATE
          ) {
            this.appConfigurationService.refreshLinkedUserVehicleDropdowns();
          }
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
