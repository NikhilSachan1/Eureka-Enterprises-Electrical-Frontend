import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import {
  ConfirmationDialogService,
  FormService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import {
  EButtonActionType,
  ETableActionTypeValue,
  IDialogActionHandler,
  IEnhancedForm,
} from '@shared/types';
import { VehicleService } from '../../services/vehicle.service';
import { LoggerService } from '@core/services';
import {
  IVehicleActionRequestDto,
  IVehicleActionResponseDto,
  IVehicleGetBaseResponseDto,
} from '../../types/vehicle.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ACTION_VEHICLE_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-action-vehicle',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './action-vehicle.component.html',
  styleUrl: './action-vehicle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionVehicleComponent implements OnInit, IDialogActionHandler {
  private readonly formService = inject(FormService);
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
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input.required<() => void>();

  protected form!: IEnhancedForm;
  protected readonly EButtonActionTypeEnum = EButtonActionType;

  protected readonly isSubmitting = signal(false);

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
    this.form = this.formService.createForm(ACTION_VEHICLE_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: null,
      context: {
        actionType,
      },
    });
  }

  onDialogAccept(): void {
    this.onSubmit(this.selectedRecord());
  }

  protected onSubmit(record: IVehicleGetBaseResponseDto[]): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData(record);
    this.executeVehicleAction(formData);
  }

  private prepareFormData(
    record: IVehicleGetBaseResponseDto[]
  ): IVehicleActionRequestDto {
    const { vehicleAssignee, vehicleImages, comment } = this.form.getData() as {
      vehicleAssignee: string;
      vehicleImages: File[];
      comment: string;
    };

    let actionTypeValue: ETableActionTypeValue | undefined;

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

    return {
      vehicleId: record[0].id,
      action: actionTypeValue as unknown as string,
      toUserId: vehicleAssignee,
      vehicleFiles: vehicleImages,
      metadata: {
        remark: comment,
      },
    };
  }

  private executeVehicleAction(formData: IVehicleActionRequestDto): void {
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

    this.isSubmitting.set(true);
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Action vehicle form validation failed');
      return false;
    }
    return true;
  }
}
