import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { EButtonActionType, IDialogActionHandler } from '@shared/types';
import {
  IWorkforceAllocationActionFormDto,
  WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG,
} from '../../config/form/action-workforce-allocation.config';
import { IWorkforceAllocationGetBaseResponseDto } from '../../types/project.dto';

@Component({
  selector: 'app-action-workforce-allocation',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './action-workforce-allocation.component.html',
  styleUrl: './action-workforce-allocation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionWorkforceAllocationComponent
  extends FormBase<IWorkforceAllocationActionFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  private trackedReleaseDate?: Signal<Date | null | undefined>;

  protected isTransferAction = false;

  private readonly transferReleaseDateMin = computed(() => {
    if (this.dialogActionType() !== EButtonActionType.TRANSFER) {
      return null;
    }

    return this.toDateOnly(this.trackedReleaseDate?.());
  });

  protected readonly allocateDateFieldConfig = computed(() => {
    const allocateDateConfig = this.form?.fieldConfigs.allocateDate;
    if (!allocateDateConfig) {
      return allocateDateConfig;
    }

    const minDate = this.transferReleaseDateMin();
    if (!minDate) {
      return allocateDateConfig;
    }

    return {
      ...allocateDateConfig,
      dateConfig: {
        ...(allocateDateConfig.dateConfig ?? {}),
        minDate,
      },
    };
  });

  protected readonly selectedRecord =
    input.required<IWorkforceAllocationGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input<() => void>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;

  constructor() {
    super();
    effect(() => {
      const minDate = this.transferReleaseDateMin();
      if (!minDate || !this.form) {
        return;
      }

      const allocateDateControl = this.form.formGroup.get('allocateDate');
      const allocateDate = this.toDateOnly(allocateDateControl?.value);

      if (allocateDate && allocateDate.getTime() < minDate.getTime()) {
        allocateDateControl?.setValue(null);
      }
    });
  }

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required for workforce allocation action but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.isTransferAction = actionType === EButtonActionType.TRANSFER;
    this.form = this.formService.createForm<IWorkforceAllocationActionFormDto>(
      WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          actionType,
        },
      }
    );

    if (this.isTransferAction) {
      this.trackedReleaseDate = this.formService.trackFieldChanges<
        Date | null | undefined
      >(this.form.formGroup, 'releaseDate', this.destroyRef);
    }
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.logger.logUserAction('Workforce allocation action form submitted', {
      actionType: this.dialogActionType(),
      formData: this.form.getData(),
      selectedRecords: this.selectedRecord(),
      selectedCount: this.selectedRecord().length,
    });
    this.isSubmitting.set(false);
    this.confirmationDialogService.closeDialog();
  }

  private toDateOnly(value: unknown): Date | null {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return null;
    }

    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
}
