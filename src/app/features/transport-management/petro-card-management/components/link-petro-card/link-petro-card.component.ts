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
  IPetroCardGetBaseResponseDto,
  IPetroCardLinkFormDto,
  IPetroCardLinkResponseDto,
  IPetroCardLinkUIFormDto,
} from '../../types/petro-card.dto';
import {
  EButtonActionType,
  ETableActionTypeValue,
  IDialogActionHandler,
} from '@shared/types';
import { PetroCardService } from '../../services/petro-card.service';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { LINK_PETRO_CARD_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IVehicleGetBaseResponseDto } from '@features/transport-management/vehicle-management/types/vehicle.dto';
import { EPetroCardLinkAction } from '../../types/petro-card.enum';

@Component({
  selector: 'app-link-petro-card',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './link-petro-card.component.html',
  styleUrl: './link-petro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkPetroCardComponent
  extends FormBase<IPetroCardLinkUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly petroCardService = inject(PetroCardService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<
      (IPetroCardGetBaseResponseDto | IVehicleGetBaseResponseDto)[]
    >();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly sourceComponent = input.required<string>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;
  protected readonly showPetroCardField = computed(() => {
    return this.sourceComponent() === 'vehicle';
  });

  protected readonly showVehicleField = computed(() => {
    return this.sourceComponent() === 'petro-card';
  });

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to link petro card but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm<IPetroCardLinkUIFormDto>(
      LINK_PETRO_CARD_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          sourceComponent: this.sourceComponent(),
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
    this.executePetroCardLinkAction(formData);
  }

  private prepareFormData(): IPetroCardLinkFormDto {
    const formData = this.form.getData();
    const source = this.sourceComponent();
    const selectedRecords = this.selectedRecord();

    let actionTypeValue!: ETableActionTypeValue | EPetroCardLinkAction;

    if (this.dialogActionType() === EButtonActionType.LINK) {
      actionTypeValue = EPetroCardLinkAction.LINK;
    } else if (this.dialogActionType() === EButtonActionType.UNLINK) {
      actionTypeValue = EPetroCardLinkAction.UNLINK;
    }

    const finalFormData: IPetroCardLinkFormDto = {
      ...formData,
      action: actionTypeValue,
    };

    if (source === 'vehicle' && selectedRecords.length > 0) {
      const vehicleRecord = selectedRecords[0] as IVehicleGetBaseResponseDto;
      finalFormData.vehicleName = vehicleRecord.id;
      if (actionTypeValue === EPetroCardLinkAction.UNLINK) {
        finalFormData.cardNumber = vehicleRecord.associatedCard?.id ?? '';
      }
    }

    if (source === 'petro-card' && selectedRecords.length > 0) {
      const petroCardRecord =
        selectedRecords[0] as IPetroCardGetBaseResponseDto;
      finalFormData.cardNumber = petroCardRecord.id;
      if (actionTypeValue === EPetroCardLinkAction.UNLINK) {
        finalFormData.vehicleName = petroCardRecord.allocatedVehicle?.id ?? '';
      }
    }

    return finalFormData;
  }

  private executePetroCardLinkAction(formData: IPetroCardLinkFormDto): void {
    let loadingMessage;

    if (
      this.sourceComponent() === 'vehicle' &&
      this.dialogActionType() === EButtonActionType.LINK
    ) {
      loadingMessage = {
        title: 'Linking Petro Card to Vehicle',
        message:
          "We're linking the petro card to the vehicle. This will just take a moment.",
      };
    } else if (
      this.sourceComponent() === 'petro-card' &&
      this.dialogActionType() === EButtonActionType.LINK
    ) {
      loadingMessage = {
        title: 'Linking Vehicle to Petro Card',
        message:
          "We're linking the vehicle to the petro card. This will just take a moment.",
      };
    } else if (
      this.sourceComponent() === 'vehicle' &&
      this.dialogActionType() === EButtonActionType.UNLINK
    ) {
      loadingMessage = {
        title: 'Unlinking Petro Card from Vehicle',
        message:
          "We're unlinking the petro card from the vehicle. This will just take a moment.",
      };
    } else if (
      this.sourceComponent() === 'petro-card' &&
      this.dialogActionType() === EButtonActionType.UNLINK
    ) {
      loadingMessage = {
        title: 'Unlinking Vehicle from Petro Card',
        message:
          "We're unlinking the vehicle from the petro card. This will just take a moment.",
      };
    }
    this.loadingService.show(loadingMessage);
    this.form.disable();

    this.petroCardService
      .linkPetroCard(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPetroCardLinkResponseDto) => {
          const { message } = response;

          this.notificationService.success(message);
          this.appConfigurationService.refreshLinkedUserVehicleDropdowns();

          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
