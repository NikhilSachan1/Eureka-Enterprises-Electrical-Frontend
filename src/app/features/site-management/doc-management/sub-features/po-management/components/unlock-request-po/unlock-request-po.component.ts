import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { PoService } from '../../services/po.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IUnlockRequestPoFormDto,
  IUnlockRequestPoResponseDto,
  IPoGetBaseResponseDto,
} from '../../types/po.dto';
import { UNLOCK_REQUEST_ACTION_PO_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-unlock-request-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './unlock-request-po.component.html',
  styleUrl: './unlock-request-po.component.scss',
})
export class UnlockRequestPoComponent
  extends FormBase<IUnlockRequestPoFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly poService = inject(PoService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord = input.required<IPoGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to request PO unlock but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IUnlockRequestPoFormDto>(
      UNLOCK_REQUEST_ACTION_PO_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const poId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executeUnlockRequestAction(formData, poId);
  }

  private prepareFormData(): IUnlockRequestPoFormDto {
    return this.form.getData();
  }

  private executeUnlockRequestAction(
    formData: IUnlockRequestPoFormDto,
    poId: string
  ): void {
    this.loadingService.show({
      title: 'Requesting unlock',
      message:
        "We're submitting your unlock request. This will just take a moment.",
    });
    this.form.disable();

    this.poService
      .unlockRequestPo(formData, poId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockRequestPoResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to request PO unlock', error);
          this.notificationService.error('Failed to request PO unlock.');
        },
      });
  }
}
